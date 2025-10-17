import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkFacetSpam, FACET_SPAM_THRESHOLD, FACET_SPAM_LABEL, FACET_SPAM_COMMENT } from "../facets.js";
import { Facet } from "../../../types.js";

// Mock dependencies
vi.mock("../../../moderation.js", () => ({
  createAccountLabel: vi.fn(),
}));

vi.mock("../../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { createAccountLabel } from "../../../moderation.js";
import { logger } from "../../../logger.js";

describe("checkFacetSpam", () => {
  const TEST_DID = "did:plc:test123";
  const TEST_TIME = Date.now() * 1000;
  const TEST_URI = "at://did:plc:test123/app.bsky.feed.post/test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no spam is present", () => {
    it("should not label when facets array is empty", async () => {
      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, []);

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should not label when facets is null/undefined", async () => {
      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, null as any);
      expect(createAccountLabel).not.toHaveBeenCalled();

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, undefined as any);
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should not label when there is only one facet", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 10 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should not label when all facets have different positions", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 10 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 11, byteEnd: 20 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user2" }],
        },
        {
          index: { byteStart: 21, byteEnd: 30 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user3" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it("should not label when facets count equals threshold (not exceeding)", async () => {
      // If threshold is 1, having exactly 1 facet at a position should not trigger
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(createAccountLabel).not.toHaveBeenCalled();
    });
  });

  describe("when spam is detected", () => {
    it("should label account when multiple facets share the same position", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user2" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(logger.info).toHaveBeenCalledWith(
        {
          process: "FACET_SPAM",
          did: TEST_DID,
          atURI: TEST_URI,
          position: "0:1",
          count: 2,
        },
        "Facet spam detected"
      );

      expect(createAccountLabel).toHaveBeenCalledWith(
        TEST_DID,
        FACET_SPAM_LABEL,
        `${TEST_TIME}: ${FACET_SPAM_COMMENT} - 2 facets at position 0:1 in ${TEST_URI}`
      );
    });

    it("should detect spam with many facets at same position (real-world example)", async () => {
      // Simulates the example from facets.json with 100+ mentions at position 0:1
      const facets: Facet[] = Array.from({ length: 100 }, (_, i) => ({
        index: { byteStart: 0, byteEnd: 1 },
        features: [{ $type: "app.bsky.richtext.facet#mention", did: `did:plc:user${i}` }],
      }));

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "FACET_SPAM",
          did: TEST_DID,
          atURI: TEST_URI,
          position: "0:1",
          count: 100,
        }),
        "Facet spam detected"
      );

      expect(createAccountLabel).toHaveBeenCalledOnce();
    });

    it("should only label once even if multiple positions exceed threshold", async () => {
      const facets: Facet[] = [
        // First spam position
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user2" }],
        },
        // Second spam position
        {
          index: { byteStart: 5, byteEnd: 10 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user3" }],
        },
        {
          index: { byteStart: 5, byteEnd: 10 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user4" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      // Should only call createAccountLabel once (early return after first detection)
      expect(createAccountLabel).toHaveBeenCalledOnce();
    });

    it("should handle different feature types at same position", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 0, byteEnd: 1 },
          features: [{ $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      // Should still detect as spam regardless of feature type
      expect(createAccountLabel).toHaveBeenCalledOnce();
    });
  });

  describe("threshold behavior", () => {
    it("should respect FACET_SPAM_THRESHOLD constant", () => {
      // Verify the threshold is set correctly
      expect(FACET_SPAM_THRESHOLD).toBe(1);
    });

    it("should use correct label and comment constants", () => {
      expect(FACET_SPAM_LABEL).toBe("suspect-inauthentic");
      expect(FACET_SPAM_COMMENT).toBe("Abusive facet usage detected (hidden mentions)");
    });
  });

  describe("edge cases", () => {
    it("should handle facets with same byteStart but different byteEnd", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 0, byteEnd: 5 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 0, byteEnd: 10 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user2" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      // Different positions (0:5 vs 0:10), so no spam
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should handle large byte positions", async () => {
      const facets: Facet[] = [
        {
          index: { byteStart: 1000000, byteEnd: 1000100 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user1" }],
        },
        {
          index: { byteStart: 1000000, byteEnd: 1000100 },
          features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:user2" }],
        },
      ];

      await checkFacetSpam(TEST_DID, TEST_TIME, TEST_URI, facets);

      expect(createAccountLabel).toHaveBeenCalledWith(
        TEST_DID,
        FACET_SPAM_LABEL,
        expect.stringContaining("1000000:1000100")
      );
    });
  });
});
