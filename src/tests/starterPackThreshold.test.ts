import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "../accountModeration.js";
import { logger } from "../logger.js";
import {
  starterPackLabelsThresholdAppliedCounter,
  starterPackThresholdChecksCounter,
  starterPackThresholdMetCounter,
} from "../metrics.js";
import {
  getStarterPackCountInWindow,
  trackStarterPackForAccount,
} from "../redis.js";
import {
  checkStarterPackThreshold,
  loadStarterPackThresholdConfigs,
} from "../starterPackThreshold.js";

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../rules/starterPackThreshold.js", () => ({
  STARTER_PACK_THRESHOLD_CONFIGS: [
    {
      threshold: 5,
      window: 24,
      windowUnit: "hours",
      accountLabel: "starter-pack-spam",
      accountComment: "Too many starter packs",
      toLabel: true,
      reportAcct: true,
      commentAcct: false,
      allowlist: ["did:plc:allowed123"],
    },
    {
      threshold: 10,
      window: 7,
      windowUnit: "days",
      accountLabel: "starter-pack-abuse",
      accountComment: "Excessive starter pack creation",
      toLabel: true,
      reportAcct: false,
      commentAcct: true,
      allowlist: [],
    },
  ],
}));

vi.mock("../redis.js", () => ({
  trackStarterPackForAccount: vi.fn(),
  getStarterPackCountInWindow: vi.fn(),
}));

vi.mock("../accountModeration.js", () => ({
  createAccountLabel: vi.fn(),
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
}));

vi.mock("../metrics.js", () => ({
  starterPackLabelsThresholdAppliedCounter: {
    inc: vi.fn(),
  },
  starterPackThresholdChecksCounter: {
    inc: vi.fn(),
  },
  starterPackThresholdMetCounter: {
    inc: vi.fn(),
  },
}));

describe("Starter Pack Threshold Logic", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loadStarterPackThresholdConfigs", () => {
    it("should load and cache configs successfully", () => {
      const configs = loadStarterPackThresholdConfigs();
      expect(configs).toHaveLength(2);
      expect(configs[0].threshold).toBe(5);
      expect(configs[1].threshold).toBe(10);
    });
  });

  describe("checkStarterPackThreshold", () => {
    const testDid = "did:plc:test123";
    const testUri = "at://did:plc:test123/app.bsky.graph.starterpack/abc";
    const testTimestamp = 1640000000000000;

    it("should skip threshold check for allowlisted accounts", async () => {
      vi.mocked(trackStarterPackForAccount).mockResolvedValue();
      vi.mocked(getStarterPackCountInWindow).mockResolvedValue(0);

      await checkStarterPackThreshold(
        "did:plc:allowed123",
        testUri,
        testTimestamp,
      );

      expect(starterPackThresholdChecksCounter.inc).toHaveBeenCalled();
      // Should skip first config (allowlist), but process second config
      expect(trackStarterPackForAccount).toHaveBeenCalledTimes(1);
      expect(logger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ did: "did:plc:allowed123" }),
        "Account is in allowlist, skipping threshold check",
      );
    });

    it("should track and check threshold for non-allowlisted accounts", async () => {
      vi.mocked(trackStarterPackForAccount).mockResolvedValue();
      vi.mocked(getStarterPackCountInWindow).mockResolvedValue(3);

      await checkStarterPackThreshold(testDid, testUri, testTimestamp);

      expect(starterPackThresholdChecksCounter.inc).toHaveBeenCalled();
      expect(trackStarterPackForAccount).toHaveBeenCalledWith(
        testDid,
        testUri,
        testTimestamp,
        24,
        "hours",
      );
      expect(getStarterPackCountInWindow).toHaveBeenCalledWith(
        testDid,
        24,
        "hours",
        testTimestamp,
      );
    });

    it("should apply account label when threshold is met", async () => {
      vi.mocked(trackStarterPackForAccount).mockResolvedValue();
      vi.mocked(getStarterPackCountInWindow).mockResolvedValue(5);
      vi.mocked(createAccountLabel).mockResolvedValue();
      vi.mocked(createAccountReport).mockResolvedValue();

      await checkStarterPackThreshold(testDid, testUri, testTimestamp);

      expect(starterPackThresholdMetCounter.inc).toHaveBeenCalledWith({
        account_label: "starter-pack-spam",
      });
      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "starter-pack-spam",
        expect.stringContaining("Too many starter packs"),
      );
      expect(createAccountReport).toHaveBeenCalled();
      expect(starterPackLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "starter-pack-spam",
        action: "label",
      });
    });

    it("should not apply label when threshold not met", async () => {
      vi.mocked(trackStarterPackForAccount).mockResolvedValue();
      vi.mocked(getStarterPackCountInWindow).mockResolvedValue(3);

      await checkStarterPackThreshold(testDid, testUri, testTimestamp);

      expect(starterPackThresholdMetCounter.inc).not.toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should handle Redis errors", async () => {
      const redisError = new Error("Redis connection failed");
      vi.mocked(trackStarterPackForAccount).mockRejectedValue(redisError);

      await expect(
        checkStarterPackThreshold(testDid, testUri, testTimestamp),
      ).rejects.toThrow("Redis connection failed");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should check all configs for each starter pack", async () => {
      vi.mocked(trackStarterPackForAccount).mockResolvedValue();
      vi.mocked(getStarterPackCountInWindow)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10);
      vi.mocked(createAccountLabel).mockResolvedValue();
      vi.mocked(createAccountReport).mockResolvedValue();
      vi.mocked(createAccountComment).mockResolvedValue();

      await checkStarterPackThreshold(testDid, testUri, testTimestamp);

      expect(trackStarterPackForAccount).toHaveBeenCalledTimes(2);
      expect(getStarterPackCountInWindow).toHaveBeenCalledTimes(2);
      expect(createAccountLabel).toHaveBeenCalledTimes(2);
    });
  });
});
