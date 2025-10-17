import { createAccountLabel } from "../../moderation.js";
import { logger } from "../../logger.js";
import { Facet } from "../../types.js";

// Threshold for duplicate facet positions before flagging as spam
export const FACET_SPAM_THRESHOLD = 1;

// Label configuration
export const FACET_SPAM_LABEL = "suspect-inauthentic";
export const FACET_SPAM_COMMENT =
  "Abusive facet usage detected (hidden mentions)";

/**
 * Checks if a post contains facet spam by detecting multiple facets
 * with identical byte positions (indicating hidden/abusive mentions)
 */
export const checkFacetSpam = async (
  did: string,
  time: number,
  atURI: string,
  facets: Facet[],
): Promise<void> => {
  if (!facets || facets.length === 0) {
    return;
  }

  // Group facets by their byte position (byteStart:byteEnd)
  const positionMap = new Map<string, number>();

  for (const facet of facets) {
    const key = `${facet.index.byteStart}:${facet.index.byteEnd}`;
    positionMap.set(key, (positionMap.get(key) || 0) + 1);
  }

  // Check if any position has more than the threshold
  for (const [position, count] of positionMap.entries()) {
    if (count > FACET_SPAM_THRESHOLD) {
      logger.info(
        {
          process: "FACET_SPAM",
          did,
          atURI,
          position,
          count,
        },
        "Facet spam detected",
      );

      await createAccountLabel(
        did,
        FACET_SPAM_LABEL,
        `${time}: ${FACET_SPAM_COMMENT} - ${count} facets at position ${position} in ${atURI}`,
      );

      // Only label once per post even if multiple positions are suspicious
      return;
    }
  }
};
