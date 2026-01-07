import { createAccountLabel } from "../../accountModeration.js";
import { logger } from "../../logger.js";
import type { Facet } from "../../types.js";

// Threshold for duplicate facet positions before flagging as spam
export const FACET_SPAM_THRESHOLD = 1;

// Label configuration
export const FACET_SPAM_LABEL = "platform-manipulation";
export const FACET_SPAM_COMMENT =
  "Abusive facet usage detected (hidden mentions)";

// Allowlist for DIDs with legitimate duplicate facet use cases
export const FACET_SPAM_ALLOWLIST: string[] = [
  "did:plc:ei7hqam5oasdpw5cdihdphcv",
];

/**
 * Checks if a post contains facet spam by detecting multiple facets
 * with identical byte positions (indicating hidden/abusive mentions)
 */
export const checkFacetSpam = async (
  did: string,
  time: number,
  atURI: string,
  facets: Facet[] | null,
): Promise<void> => {
  // Check allowlist
  if (FACET_SPAM_ALLOWLIST.includes(did)) {
    logger.debug({ process: "FACET_SPAM", did, atURI }, "Allowlisted DID");
    return;
  }

  if (!facets || facets.length === 0) {
    return;
  }

  // Group mention facets by their byte position (byteStart:byteEnd)
  // Track unique DIDs per position - only flag if DIFFERENT DIDs at same position
  // Same DID duplicated = bug, different DIDs = spam
  const positionMap = new Map<string, Set<string>>();

  for (const facet of facets) {
    // Only check mentions for spam detection
    const mentionFeature = facet.features.find(
      (feature) => feature.$type === "app.bsky.richtext.facet#mention",
    );

    if (mentionFeature && "did" in mentionFeature) {
      const key = `${facet.index.byteStart.toString()}:${facet.index.byteEnd.toString()}`;
      if (!positionMap.has(key)) {
        positionMap.set(key, new Set());
      }
      const dids = positionMap.get(key);
      if (
        dids &&
        "did" in mentionFeature &&
        typeof mentionFeature.did === "string"
      ) {
        dids.add(mentionFeature.did);
      }
    }
  }

  // Check if any position has more than the threshold unique DIDs
  for (const [position, dids] of positionMap.entries()) {
    const uniqueCount = dids.size;
    if (uniqueCount > FACET_SPAM_THRESHOLD) {
      logger.info(
        {
          process: "FACET_SPAM",
          did,
          atURI,
          position,
          count: uniqueCount,
        },
        "Facet spam detected",
      );

      await createAccountLabel(
        did,
        FACET_SPAM_LABEL,
        `${time.toString()}: ${FACET_SPAM_COMMENT} \n\n${uniqueCount.toString()} unique mentions at position ${position}. \n\nPost: ${atURI}`,
      );

      // Only label once per post even if multiple positions are suspicious
      return;
    }
  }
};
