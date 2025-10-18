import { agent, isLoggedIn } from "../agent.js";
import { logger } from "../logger.js";
import { createAccountLabel } from "../moderation.js";
import { ACCOUNT_AGE_CHECKS } from "./ageConstants.js";
import { PLC_URL } from "../config.js";

interface ReplyContext {
  replyToDid: string;
  replyingDid: string;
  atURI: string;
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
        const response = await fetch(`https://${PLC_URL}/${did}`);
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
      if (profile.data.indexedAt) {
        return new Date(profile.data.indexedAt);
      }
    } catch (profileError) {
      logger.debug(
        { process: "ACCOUNT_AGE", did },
        "Failed to get profile",
      );
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
 * Checks if a reply meets age criteria and applies labels accordingly
 */
export const checkAccountAge = async (
  context: ReplyContext,
): Promise<void> => {
  // Skip if no checks configured
  if (ACCOUNT_AGE_CHECKS.length === 0) {
    return;
  }

  // Check each configuration
  for (const check of ACCOUNT_AGE_CHECKS) {
    // Check if this reply is to a monitored DID
    if (!check.monitoredDIDs.includes(context.replyToDid)) {
      continue;
    }

    logger.debug(
      {
        process: "ACCOUNT_AGE",
        replyingDid: context.replyingDid,
        replyToDid: context.replyToDid,
      },
      "Checking account age for reply to monitored DID",
    );

    // Get account creation date
    const creationDate = await getAccountCreationDate(context.replyingDid);
    if (!creationDate) {
      logger.warn(
        {
          process: "ACCOUNT_AGE",
          replyingDid: context.replyingDid,
        },
        "Could not determine creation date, skipping",
      );
      continue;
    }

    // Calculate age at anchor date
    const anchorDate = new Date(check.anchorDate);
    const accountAge = calculateAccountAge(creationDate, anchorDate);

    logger.debug(
      {
        process: "ACCOUNT_AGE",
        replyingDid: context.replyingDid,
        creationDate: creationDate.toISOString(),
        anchorDate: check.anchorDate,
        accountAge,
        threshold: check.maxAgeDays,
      },
      "Account age calculated",
    );

    // Check if account is too new
    if (accountAge < check.maxAgeDays) {
      logger.info(
        {
          process: "ACCOUNT_AGE",
          replyingDid: context.replyingDid,
          replyToDid: context.replyToDid,
          accountAge,
          threshold: check.maxAgeDays,
          atURI: context.atURI,
        },
        "Labeling new account replying to monitored DID",
      );

      await createAccountLabel(
        context.replyingDid,
        check.label,
        `${context.time}: ${check.comment} - Account age: ${accountAge} days (threshold: ${check.maxAgeDays} days) - Reply: ${context.atURI}`,
      );

      // Only apply one label per reply
      return;
    }
  }
};
