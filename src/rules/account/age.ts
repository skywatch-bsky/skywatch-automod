import { agent, isLoggedIn } from "../../agent.js";
import { PLC_URL } from "../../config.js";
import { GLOBAL_ALLOW } from "../../constants.js";
import { logger } from "../../logger.js";
import { checkAccountLabels, createAccountLabel } from "../../moderation.js";
import { ACCOUNT_AGE_CHECKS } from "./ageConstants.js";

interface InteractionContext {
  // For replies
  replyToDid?: string;
  replyingDid?: string;
  replyToPostURI?: string; // The URI of the post being replied to (optional)

  // For quote posts
  quotedDid?: string; // DID of the account whose post is being quoted
  quotedPostURI?: string; // URI of the post being quoted

  // Common fields (required)
  actorDid: string; // The DID performing the action (replying or quoting)
  atURI: string; // URI of the reply or quote post
  time: number;
}

/**
 * Gets the account creation date from a DID
 * Uses the plc directory to get DID document creation timestamp
 */
export const getAccountCreationDate = async (
  did: string,
): Promise<Date | null> => {
  try {
    await isLoggedIn;

    // For plc DIDs, try to extract creation from the DID document
    if (did.startsWith("did:plc:")) {
      try {
        const response = await fetch(`https://${PLC_URL}/${did}/log/audit`);
        if (response.ok) {
          const didDoc = await response.json();

          // The plc directory returns an array of operations, first one is creation
          if (Array.isArray(didDoc) && didDoc.length > 0) {
            const createdAt = didDoc[0].createdAt;
            if (createdAt) {
              return new Date(createdAt);
            }
          }
        } else {
          logger.debug(
            { process: "ACCOUNT_AGE", did },
            "Failed to fetch DID document, trying profile fallback",
          );
        }
      } catch (plcError) {
        logger.debug(
          { process: "ACCOUNT_AGE", did },
          "Error fetching from plc directory, trying profile fallback",
        );
      }
    }

    // Fallback: try getting profile for any DID type
    try {
      const profile = await agent.getProfile({ actor: did });
      if (profile.data.createdAt) {
        return new Date(profile.data.createdAt);
      }
    } catch (profileError) {
      logger.debug({ process: "ACCOUNT_AGE", did }, "Failed to get profile");
    }

    logger.warn(
      { process: "ACCOUNT_AGE", did },
      "Could not determine account creation date",
    );
    return null;
  } catch (error) {
    logger.error(
      { process: "ACCOUNT_AGE", did, error },
      "Error fetching account creation date",
    );
    return null;
  }
};

/**
 * Calculates the age of an account in days at a specific reference date
 */
export const calculateAccountAge = (
  creationDate: Date,
  referenceDate: Date,
): number => {
  const diffMs = referenceDate.getTime() - creationDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a reply or quote post meets age criteria and applies labels accordingly
 */
export const checkAccountAge = async (
  context: InteractionContext,
): Promise<void> => {
  // Skip if no checks configured
  if (ACCOUNT_AGE_CHECKS.length === 0) {
    return;
  }

  // Skip if DID is globally allowlisted
  if (GLOBAL_ALLOW.includes(context.actorDid)) {
    logger.debug(
      {
        process: "ACCOUNT_AGE",
        did: context.actorDid,
        atURI: context.atURI,
      },
      "Global allowlisted DID",
    );
    return;
  }

  // Check each configuration
  for (const check of ACCOUNT_AGE_CHECKS) {
    // Check if this interaction matches monitored DIDs or post URIs
    // For replies: check replyToDid and replyToPostURI
    // For quotes: check quotedDid and quotedPostURI
    const matchesReplyDID =
      check.monitoredDIDs &&
      context.replyToDid &&
      check.monitoredDIDs.includes(context.replyToDid);
    const matchesReplyPostURI =
      check.monitoredPostURIs &&
      context.replyToPostURI &&
      check.monitoredPostURIs.includes(context.replyToPostURI);
    const matchesQuoteDID =
      check.monitoredDIDs &&
      context.quotedDid &&
      check.monitoredDIDs.includes(context.quotedDid);
    const matchesQuotePostURI =
      check.monitoredPostURIs &&
      context.quotedPostURI &&
      check.monitoredPostURIs.includes(context.quotedPostURI);

    if (
      !matchesReplyDID &&
      !matchesReplyPostURI &&
      !matchesQuoteDID &&
      !matchesQuotePostURI
    ) {
      continue;
    }

    // Skip if check has expired
    if (check.expires) {
      const expiresDate = new Date(check.expires);
      const now = new Date();
      if (now > expiresDate) {
        logger.debug(
          { process: "ACCOUNT_AGE", expires: check.expires },
          "Check has expired, skipping",
        );
        continue;
      }
    }

    logger.debug(
      {
        process: "ACCOUNT_AGE",
        actorDid: context.actorDid,
        replyToDid: context.replyToDid,
        quotedDid: context.quotedDid,
      },
      "Checking account age for interaction with monitored target",
    );

    // Get account creation date
    const creationDate = await getAccountCreationDate(context.actorDid);
    if (!creationDate) {
      logger.warn(
        {
          process: "ACCOUNT_AGE",
          actorDid: context.actorDid,
        },
        "Could not determine creation date, skipping",
      );
      continue;
    }

    // Define the flagging window
    const windowStart = new Date(check.anchorDate);
    const windowEnd = new Date(windowStart);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + check.maxAgeDays);
    windowEnd.setUTCHours(23, 59, 59, 999);

    logger.debug(
      {
        process: "ACCOUNT_AGE",
        actorDid: context.actorDid,
        creationDate: creationDate.toISOString(),
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
      "Checking if account creation date is within the window",
    );

    // Check if account was created within the window
    if (creationDate >= windowStart && creationDate <= windowEnd) {
      // Check if the label already exists to prevent duplicates
      const labelExists = await checkAccountLabels(
        context.actorDid,
        check.label,
      );

      if (labelExists) {
        logger.debug(
          {
            process: "ACCOUNT_AGE",
            actorDid: context.actorDid,
            label: check.label,
          },
          "Label already exists, skipping duplicate",
        );
        // Only apply one label per interaction
        return;
      }

      logger.info(
        {
          process: "ACCOUNT_AGE",
          actorDid: context.actorDid,
          replyToDid: context.replyToDid,
          quotedDid: context.quotedDid,
          atURI: context.atURI,
        },
        "Labeling account created within the monitored date range",
      );

      await createAccountLabel(
        context.actorDid,
        check.label,
        `${context.time}: ${check.comment} - Account created within monitored range - Interaction: ${context.atURI}`,
      );

      // Only apply one label per interaction
      return;
    }
  }
};
