import { beforeEach, describe, expect, it, vi } from "vitest";
import { agent } from "../agent.js";
import { logger } from "../logger.js";
import { checkAccountLabels } from "../moderation.js";

// Mock dependencies
vi.mock("../agent.js", () => ({
  agent: {
    tools: {
      ozone: {
        moderation: {
          getRepo: vi.fn(),
        },
      },
    },
  },
  isLoggedIn: Promise.resolve(true),
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

describe("checkAccountLabels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if label exists on account", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {
        labels: [
          { val: "spam" },
          { val: "harassment" },
          { val: "window-reply" },
        ],
      },
    });

    const result = await checkAccountLabels("did:plc:test123", "window-reply");

    expect(result).toBe(true);
    expect(agent.tools.ozone.moderation.getRepo).toHaveBeenCalledWith(
      { did: "did:plc:test123" },
      {
        headers: {
          "atproto-proxy": "did:plc:moderator123#atproto_labeler",
          "atproto-accept-labelers": "did:plc:ar7c4by46qjdydhdevvrndac;redact",
        },
      },
    );
  });

  it("should return false if label does not exist on account", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {
        labels: [{ val: "spam" }, { val: "harassment" }],
      },
    });

    const result = await checkAccountLabels("did:plc:test123", "window-reply");

    expect(result).toBe(false);
  });

  it("should return false if account has no labels", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {
        labels: [],
      },
    });

    const result = await checkAccountLabels("did:plc:test123", "window-reply");

    expect(result).toBe(false);
  });

  it("should return false if labels property is undefined", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {},
    });

    const result = await checkAccountLabels("did:plc:test123", "window-reply");

    expect(result).toBe(false);
  });

  it("should handle API errors gracefully", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockRejectedValueOnce(
      new Error("API Error"),
    );

    const result = await checkAccountLabels("did:plc:test123", "window-reply");

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      {
        process: "MODERATION",
        did: "did:plc:test123",
        error: expect.any(Error),
      },
      "Failed to check account labels",
    );
  });

  it("should perform case-sensitive label matching", async () => {
    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {
        labels: [{ val: "window-reply" }],
      },
    });

    const resultLower = await checkAccountLabels(
      "did:plc:test123",
      "window-reply",
    );
    expect(resultLower).toBe(true);

    (agent.tools.ozone.moderation.getRepo as any).mockResolvedValueOnce({
      data: {
        labels: [{ val: "window-reply" }],
      },
    });

    const resultUpper = await checkAccountLabels(
      "did:plc:test123",
      "Window-Reply",
    );
    expect(resultUpper).toBe(false);
  });
});
