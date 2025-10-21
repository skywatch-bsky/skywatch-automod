import { beforeEach, describe, expect, it, vi } from "vitest";
// --- Imports Second ---
import { checkAccountLabels } from "../accountModeration.js";
import { agent } from "../agent.js";
import { createPostLabel } from "../moderation.js";
import { tryClaimPostLabel } from "../redis.js";

// --- Mocks First ---

vi.mock("../agent.js", () => ({
  agent: {
    tools: {
      ozone: {
        moderation: {
          getRepo: vi.fn(),
          getRecord: vi.fn(),
          emitEvent: vi.fn(),
        },
      },
    },
  },
  isLoggedIn: Promise.resolve(true),
}));

vi.mock("../redis.js", () => ({
  tryClaimPostLabel: vi.fn(),
  tryClaimAccountLabel: vi.fn(),
}));

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../config.js", () => ({
  MOD_DID: "did:plc:moderator123",
}));

vi.mock("../limits.js", () => ({
  limit: vi.fn((fn) => fn()),
}));

describe("Moderation Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAccountLabels", () => {
    it("should return true if label exists on account", async () => {
      vi.mocked(agent.tools.ozone.moderation.getRepo).mockResolvedValueOnce({
        data: {
          labels: [
            {
              val: "spam",
              src: "did:plc:test",
              uri: "at://test",
              cts: "2024-01-01T00:00:00Z",
            },
            {
              val: "window-reply",
              src: "did:plc:test",
              uri: "at://test",
              cts: "2024-01-01T00:00:00Z",
            },
          ],
        },
      } as any);
      const result = await checkAccountLabels(
        "did:plc:test123",
        "window-reply",
      );
      expect(result).toBe(true);
    });
  });

  describe("createPostLabel with Caching", () => {
    const URI = "at://did:plc:test/app.bsky.feed.post/123";
    const CID = "bafybeig6xv5nwph5j7grrlp3pdeolqptpep5nfljmdkmtcf2l4wisa2mfa";
    const LABEL = "test-label";
    const COMMENT = "test comment";

    it("should skip if claim fails (already claimed)", async () => {
      vi.mocked(tryClaimPostLabel).mockResolvedValue(false);

      await createPostLabel(URI, CID, LABEL, COMMENT, undefined);

      expect(vi.mocked(tryClaimPostLabel)).toHaveBeenCalledWith(URI, LABEL);
      expect(
        vi.mocked(agent.tools.ozone.moderation.getRecord),
      ).not.toHaveBeenCalled();
      expect(
        vi.mocked(agent.tools.ozone.moderation.emitEvent),
      ).not.toHaveBeenCalled();
    });

    it("should skip event if claimed but already labeled via API", async () => {
      vi.mocked(tryClaimPostLabel).mockResolvedValue(true);
      vi.mocked(agent.tools.ozone.moderation.getRecord).mockResolvedValue({
        data: {
          labels: [
            {
              val: LABEL,
              src: "did:plc:test",
              uri: URI,
              cts: "2024-01-01T00:00:00Z",
            },
          ],
        },
      } as any);

      await createPostLabel(URI, CID, LABEL, COMMENT, undefined);

      expect(vi.mocked(tryClaimPostLabel)).toHaveBeenCalledWith(URI, LABEL);
      expect(
        vi.mocked(agent.tools.ozone.moderation.getRecord),
      ).toHaveBeenCalledWith({ uri: URI }, expect.any(Object));
      expect(
        vi.mocked(agent.tools.ozone.moderation.emitEvent),
      ).not.toHaveBeenCalled();
    });

    it("should emit event if claimed and not labeled anywhere", async () => {
      vi.mocked(tryClaimPostLabel).mockResolvedValue(true);
      vi.mocked(agent.tools.ozone.moderation.getRecord).mockResolvedValue({
        data: { labels: [] },
      } as any);
      vi.mocked(agent.tools.ozone.moderation.emitEvent).mockResolvedValue({
        success: true,
      } as any);

      await createPostLabel(URI, CID, LABEL, COMMENT, undefined);

      expect(vi.mocked(tryClaimPostLabel)).toHaveBeenCalledWith(URI, LABEL);
      expect(
        vi.mocked(agent.tools.ozone.moderation.getRecord),
      ).toHaveBeenCalledWith({ uri: URI }, expect.any(Object));
      expect(
        vi.mocked(agent.tools.ozone.moderation.emitEvent),
      ).toHaveBeenCalled();
    });
  });
});
