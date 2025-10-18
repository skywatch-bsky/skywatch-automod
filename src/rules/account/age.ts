import { agent, isLoggedIn } from "../../agent.js";
import { logger } from "../../logger.js";
import { createAccountLabel, checkAccountLabels } from "../../moderation.js";
import { ACCOUNT_AGE_CHECKS } from "./ageConstants.js";
import { PLC_URL } from "../../config.js";
import { GLOBAL_ALLOW } from "../../constants.js";

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
 * Checks if a reply meets age criteria and applies labels accordingly
 */
export const checkAccountAge = async (context: ReplyContext): Promise<void> => {
  // Skip if no checks configured
  if (ACCOUNT_AGE_CHECKS.length === 0) {
    return;
  }

  // Skip if DID is globally allowlisted
  if (GLOBAL_ALLOW.includes(context.replyingDid)) {
    logger.debug(
      {
        process: "ACCOUNT_AGE",
        did: context.replyingDid,
        atURI: context.atURI,
      },
      "Global allowlisted DID",
    );
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

    // Define the flagging window
    const windowStart = new Date(check.anchorDate);
    const windowEnd = new Date(windowStart);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + check.maxAgeDays);
    windowEnd.setUTCHours(23, 59, 59, 999);

    logger.debug(
      {
        process: "ACCOUNT_AGE",
        replyingDid: context.replyingDid,
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
        context.replyingDid,
        check.label,
      );

      if (labelExists) {
        logger.debug(
          {
            process: "ACCOUNT_AGE",
            replyingDid: context.replyingDid,
            label: check.label,
          },
          "Label already exists, skipping duplicate",
        );
        // Only apply one label per reply
        return;
      }

      logger.info(
        {
          process: "ACCOUNT_AGE",
          replyingDid: context.replyingDid,
          replyToDid: context.replyToDid,
          atURI: context.atURI,
        },
        "Labeling account created within the monitored date range",
      );

      await createAccountLabel(
        context.replyingDid,
        check.label,
        `${context.time}: ${check.comment} - Account created within monitored range - Reply: ${context.atURI}`,
      );

      // Only apply one label per reply
      return;
    }
  }
};
