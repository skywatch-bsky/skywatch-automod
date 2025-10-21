import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "../accountModeration.js";
import {
  checkAccountThreshold,
  loadThresholdConfigs,
} from "../accountThreshold.js";
import { logger } from "../logger.js";
import {
  accountLabelsThresholdAppliedCounter,
  accountThresholdChecksCounter,
  accountThresholdMetCounter,
} from "../metrics.js";
import {
  getPostLabelCountInWindow,
  trackPostLabelForAccount,
} from "../redis.js";

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../rules/accountThreshold.js", () => ({
  ACCOUNT_THRESHOLD_CONFIGS: [
    {
      labels: ["test-label"],
      threshold: 3,
      accountLabel: "test-account-label",
      accountComment: "Test comment",
      windowDays: 5,
      reportAcct: false,
      commentAcct: false,
      toLabel: true,
    },
    {
      labels: ["label-1", "label-2", "label-3"],
      threshold: 5,
      accountLabel: "multi-label-account",
      accountComment: "Multi label comment",
      windowDays: 7,
      reportAcct: true,
      commentAcct: true,
      toLabel: true,
    },
    {
      labels: "monitor-only-label",
      threshold: 2,
      accountLabel: "monitored",
      accountComment: "Monitoring comment",
      windowDays: 3,
      reportAcct: true,
      commentAcct: false,
      toLabel: false,
    },
    {
      labels: ["label-1", "shared-label"],
      threshold: 2,
      accountLabel: "shared-config",
      accountComment: "Shared config comment",
      windowDays: 4,
      reportAcct: false,
      commentAcct: false,
      toLabel: true,
    },
  ],
}));

vi.mock("../redis.js", () => ({
  trackPostLabelForAccount: vi.fn(),
  getPostLabelCountInWindow: vi.fn(),
}));

vi.mock("../accountModeration.js", () => ({
  createAccountLabel: vi.fn(),
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
}));

vi.mock("../metrics.js", () => ({
  accountLabelsThresholdAppliedCounter: {
    inc: vi.fn(),
  },
  accountThresholdChecksCounter: {
    inc: vi.fn(),
  },
  accountThresholdMetCounter: {
    inc: vi.fn(),
  },
}));

describe("Account Threshold Logic", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loadThresholdConfigs", () => {
    it("should load and cache configs successfully", () => {
      const configs = loadThresholdConfigs();
      expect(configs).toHaveLength(4);
      expect(configs[0].labels).toEqual(["test-label"]);
      expect(configs[1].labels).toEqual(["label-1", "label-2", "label-3"]);
    });

    it("should return cached configs on subsequent calls", () => {
      const configs1 = loadThresholdConfigs();
      const configs2 = loadThresholdConfigs();
      expect(configs1).toBe(configs2);
    });
  });

  describe("checkAccountThreshold", () => {
    const testDid = "did:plc:test123";
    const testTimestamp = 1640000000000000;

    it("should not check threshold for non-matching labels", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(0);

      await checkAccountThreshold(testDid, "non-matching-label", testTimestamp);

      expect(trackPostLabelForAccount).not.toHaveBeenCalled();
      expect(getPostLabelCountInWindow).not.toHaveBeenCalled();
    });

    it("should track and check threshold for matching single label", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(2);

      await checkAccountThreshold(testDid, "test-label", testTimestamp);

      expect(accountThresholdChecksCounter.inc).toHaveBeenCalledWith({
        post_label: "test-label",
      });
      expect(trackPostLabelForAccount).toHaveBeenCalledWith(
        testDid,
        "test-label",
        testTimestamp,
        5,
      );
      expect(getPostLabelCountInWindow).toHaveBeenCalledWith(
        testDid,
        ["test-label"],
        5,
        testTimestamp,
      );
    });

    it("should apply account label when threshold is met", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(3);
      vi.mocked(createAccountLabel).mockResolvedValue();

      await checkAccountThreshold(testDid, "test-label", testTimestamp);

      expect(accountThresholdMetCounter.inc).toHaveBeenCalledWith({
        account_label: "test-account-label",
      });
      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "test-account-label",
        "Test comment",
      );
      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "test-account-label",
        action: "label",
      });
    });

    it("should not apply label when threshold not met", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(2);

      await checkAccountThreshold(testDid, "test-label", testTimestamp);

      expect(accountThresholdMetCounter.inc).not.toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should handle multi-label config with OR logic", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(5);
      vi.mocked(createAccountLabel).mockResolvedValue();
      vi.mocked(createAccountReport).mockResolvedValue();
      vi.mocked(createAccountComment).mockResolvedValue();

      await checkAccountThreshold(testDid, "label-2", testTimestamp);

      expect(getPostLabelCountInWindow).toHaveBeenCalledWith(
        testDid,
        ["label-1", "label-2", "label-3"],
        7,
        testTimestamp,
      );
      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "multi-label-account",
        "Multi label comment",
      );
      expect(createAccountReport).toHaveBeenCalledWith(
        testDid,
        "Multi label comment",
      );
      expect(createAccountComment).toHaveBeenCalled();
    });

    it("should track but not label when toLabel is false", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockResolvedValue(2);
      vi.mocked(createAccountReport).mockResolvedValue();

      await checkAccountThreshold(testDid, "monitor-only-label", testTimestamp);

      expect(trackPostLabelForAccount).toHaveBeenCalled();
      expect(getPostLabelCountInWindow).toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(createAccountReport).toHaveBeenCalled();
      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "monitored",
        action: "report",
      });
    });

    it("should increment all action metrics when threshold met", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1);
      vi.mocked(createAccountLabel).mockResolvedValue();
      vi.mocked(createAccountReport).mockResolvedValue();
      vi.mocked(createAccountComment).mockResolvedValue();

      await checkAccountThreshold(testDid, "label-1", testTimestamp);

      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledTimes(3);
      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "multi-label-account",
        action: "label",
      });
      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "multi-label-account",
        action: "report",
      });
      expect(accountLabelsThresholdAppliedCounter.inc).toHaveBeenCalledWith({
        account_label: "multi-label-account",
        action: "comment",
      });
    });

    it("should handle Redis errors in trackPostLabelForAccount", async () => {
      const redisError = new Error("Redis connection failed");
      vi.mocked(trackPostLabelForAccount).mockRejectedValue(redisError);

      await expect(
        checkAccountThreshold(testDid, "test-label", testTimestamp),
      ).rejects.toThrow("Redis connection failed");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle Redis errors in getPostLabelCountInWindow", async () => {
      const redisError = new Error("Redis query failed");
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow).mockRejectedValue(redisError);

      await expect(
        checkAccountThreshold(testDid, "test-label", testTimestamp),
      ).rejects.toThrow("Redis query failed");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle multiple matching configs", async () => {
      vi.mocked(trackPostLabelForAccount).mockResolvedValue();
      vi.mocked(getPostLabelCountInWindow)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);
      vi.mocked(createAccountLabel).mockResolvedValue();
      vi.mocked(createAccountReport).mockResolvedValue();
      vi.mocked(createAccountComment).mockResolvedValue();

      await checkAccountThreshold(testDid, "label-1", testTimestamp);

      expect(trackPostLabelForAccount).toHaveBeenCalledTimes(2);
      expect(getPostLabelCountInWindow).toHaveBeenCalledTimes(2);
      expect(createAccountLabel).toHaveBeenCalledTimes(2);
    });
  });
});
