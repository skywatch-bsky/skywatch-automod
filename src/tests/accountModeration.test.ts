import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllAccountLabels, negateAccountLabel } from "../accountModeration.js";
import { agent } from "../agent.js";

vi.mock("../agent.js", () => ({
  agent: {
    did: "did:plc:test-moderator",
    tools: {
      ozone: {
        moderation: {
          getRepo: vi.fn(),
          emitEvent: vi.fn(),
        },
      },
    },
  },
  isLoggedIn: Promise.resolve(),
}));

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../limits.js", () => ({
  limit: vi.fn((fn) => fn()),
}));

vi.mock("../redis.js", () => ({
  deleteAccountLabelClaim: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../metrics.js", () => ({
  unlabelsRemovedCounter: {
    inc: vi.fn(),
  },
  labelsAppliedCounter: {
    inc: vi.fn(),
  },
  labelsCachedCounter: {
    inc: vi.fn(),
  },
}));

const mockAgent = agent as any;

describe("getAllAccountLabels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return array of label strings from API response", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [{ val: "blue-heart-emoji" }, { val: "hammer-sickle" }],
      },
    });

    const labels = await getAllAccountLabels("did:plc:test123");

    expect(labels).toEqual(["blue-heart-emoji", "hammer-sickle"]);
    expect(mockAgent.tools.ozone.moderation.getRepo).toHaveBeenCalledWith(
      { did: "did:plc:test123" },
      expect.objectContaining({
        headers: expect.any(Object),
      }),
    );
  });

  it("should return empty array when account has no labels", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: undefined,
      },
    });

    const labels = await getAllAccountLabels("did:plc:test123");

    expect(labels).toEqual([]);
  });

  it("should return empty array when labels array is empty", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [],
      },
    });

    const labels = await getAllAccountLabels("did:plc:test123");

    expect(labels).toEqual([]);
  });

  it("should return empty array on API error", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockRejectedValueOnce(
      new Error("API Error"),
    );

    const labels = await getAllAccountLabels("did:plc:test123");

    expect(labels).toEqual([]);
  });
});

describe("negateAccountLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit moderation event to remove label", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [{ val: "blue-heart-emoji" }],
      },
    });

    mockAgent.tools.ozone.moderation.emitEvent.mockResolvedValueOnce({});

    await negateAccountLabel(
      "did:plc:test123",
      "blue-heart-emoji",
      "Test removal",
    );

    expect(mockAgent.tools.ozone.moderation.emitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({
          $type: "tools.ozone.moderation.defs#modEventLabel",
          createLabelVals: [],
          negateLabelVals: ["blue-heart-emoji"],
          comment: "Test removal",
        }),
        subject: expect.objectContaining({
          $type: "com.atproto.admin.defs#repoRef",
          did: "did:plc:test123",
        }),
      }),
      expect.any(Object),
    );
  });

  it("should not emit event if label does not exist on account", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [{ val: "other-label" }],
      },
    });

    await negateAccountLabel(
      "did:plc:test123",
      "blue-heart-emoji",
      "Test removal",
    );

    expect(mockAgent.tools.ozone.moderation.emitEvent).not.toHaveBeenCalled();
  });

  it("should not emit event if account has no labels", async () => {
    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [],
      },
    });

    await negateAccountLabel(
      "did:plc:test123",
      "blue-heart-emoji",
      "Test removal",
    );

    expect(mockAgent.tools.ozone.moderation.emitEvent).not.toHaveBeenCalled();
  });

  it("should delete Redis cache key on successful removal", async () => {
    const { deleteAccountLabelClaim } = await import("../redis.js");

    mockAgent.tools.ozone.moderation.getRepo.mockResolvedValueOnce({
      data: {
        labels: [{ val: "blue-heart-emoji" }],
      },
    });

    mockAgent.tools.ozone.moderation.emitEvent.mockResolvedValueOnce({});

    await negateAccountLabel(
      "did:plc:test123",
      "blue-heart-emoji",
      "Test removal",
    );

    expect(deleteAccountLabelClaim).toHaveBeenCalledWith(
      "did:plc:test123",
      "blue-heart-emoji",
    );
  });

  it("should log error if API call fails", async () => {
    const { logger } = await import("../logger.js");

    mockAgent.tools.ozone.moderation.getRepo.mockRejectedValueOnce(
      new Error("API Error"),
    );

    await negateAccountLabel(
      "did:plc:test123",
      "blue-heart-emoji",
      "Test removal",
    );

    expect(logger.error).toHaveBeenCalled();
  });
});
