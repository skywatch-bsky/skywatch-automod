import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkHandle } from "./checkHandles.js";
import {
  createAccountReport,
  createAccountComment,
  createAccountLabel,
} from "../../moderation.js";

// Mock dependencies
vi.mock("../../moderation.js", () => ({
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
  createAccountLabel: vi.fn(),
}));

vi.mock("../../logger.js", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../constants.js", () => ({
  GLOBAL_ALLOW: ["did:plc:globalallow"],
}));

// Mock HANDLE_CHECKS with various test scenarios
vi.mock("./constants.js", () => ({
  HANDLE_CHECKS: [
    {
      label: "spam",
      comment: "Spam detected",
      reportAcct: true,
      commentAcct: false,
      toLabel: false,
      check: /spam/i,
    },
    {
      label: "scam",
      comment: "Scam detected",
      reportAcct: false,
      commentAcct: true,
      toLabel: false,
      check: /scam/i,
      whitelist: /legit-scam/i,
    },
    {
      label: "bot",
      comment: "Bot detected",
      reportAcct: false,
      commentAcct: false,
      toLabel: true,
      check: /bot-\d+/i,
      ignoredDIDs: ["did:plc:ignoredbot"],
    },
    {
      label: "multi-action",
      comment: "Multi-action triggered",
      reportAcct: true,
      commentAcct: true,
      toLabel: true,
      check: /dangerous/i,
    },
    {
      label: "whitelist-test",
      comment: "Whitelisted pattern",
      reportAcct: true,
      commentAcct: false,
      toLabel: false,
      check: /test/i,
      whitelist: /good-test/i,
      ignoredDIDs: ["did:plc:testuser"],
    },
  ],
}));

describe("checkHandle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("global allow list", () => {
    it("should skip checks for globally allowed DIDs", async () => {
      await checkHandle("did:plc:globalallow", "spam-account", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should process non-globally-allowed DIDs", async () => {
      await checkHandle("did:plc:normal", "spam-account", Date.now());

      expect(createAccountReport).toHaveBeenCalled();
    });
  });

  describe("pattern matching", () => {
    it("should trigger on matching pattern", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "spam-account", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Spam detected - spam-account`,
      );
    });

    it("should not trigger on non-matching pattern", async () => {
      await checkHandle("did:plc:user1", "normal-account", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should be case insensitive", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "SPAM-ACCOUNT", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Spam detected - SPAM-ACCOUNT`,
      );
    });
  });

  describe("whitelist handling", () => {
    it("should not trigger on whitelisted pattern", async () => {
      await checkHandle("did:plc:user1", "legit-scam-detector", Date.now());

      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should trigger on non-whitelisted match", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "scam-account", time);

      expect(createAccountComment).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Scam detected - scam-account`,
      );
    });
  });

  describe("ignored DIDs", () => {
    it("should skip checks for ignored DIDs in specific rules", async () => {
      await checkHandle("did:plc:ignoredbot", "bot-123", Date.now());

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should process non-ignored DIDs for specific rules", async () => {
      const time = Date.now();
      await checkHandle("did:plc:normaluser", "bot-456", time);

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:normaluser",
        "bot",
        `${time}: Bot detected - bot-456`,
      );
    });
  });

  describe("action types", () => {
    it("should create report when reportAcct is true", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "spam-user", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Spam detected - spam-user`,
      );
    });

    it("should create comment when commentAcct is true", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "scam-user", time);

      expect(createAccountComment).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Scam detected - scam-user`,
      );
    });

    it("should create label when toLabel is true", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "bot-789", time);

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:user1",
        "bot",
        `${time}: Bot detected - bot-789`,
      );
    });

    it("should perform multiple actions when configured", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "dangerous-account", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Multi-action triggered - dangerous-account`,
      );
      expect(createAccountComment).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Multi-action triggered - dangerous-account`,
      );
      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:user1",
        "multi-action",
        `${time}: Multi-action triggered - dangerous-account`,
      );
    });
  });

  describe("multiple rule matching", () => {
    it("should process all matching rules", async () => {
      vi.resetModules();
      // Re-import with a mock that has overlapping patterns
      vi.doMock("./constants.js", () => ({
        HANDLE_CHECKS: [
          {
            label: "pattern1",
            comment: "Pattern 1",
            reportAcct: true,
            commentAcct: false,
            toLabel: false,
            check: /test/i,
          },
          {
            label: "pattern2",
            comment: "Pattern 2",
            reportAcct: false,
            commentAcct: true,
            toLabel: false,
            check: /test/i,
          },
        ],
      }));

      const { checkHandle: checkHandleReimport } = await import(
        "./checkHandles.js"
      );
      const time = Date.now();
      await checkHandleReimport("did:plc:user1", "test-account", time);

      expect(createAccountReport).toHaveBeenCalledTimes(1);
      expect(createAccountComment).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle empty handle strings", async () => {
      await checkHandle("did:plc:user1", "", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should handle special characters in handles", async () => {
      await checkHandle(
        "did:plc:user1",
        "spam-!@#$%^&*()",
        Date.now(),
      );

      expect(createAccountReport).toHaveBeenCalled();
    });

    it("should handle very long handles", async () => {
      const longHandle = "spam-" + "a".repeat(1000);
      const time = Date.now();
      await checkHandle("did:plc:user1", longHandle, time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        `${time}: Spam detected - ${longHandle}`,
      );
    });

    it("should handle unicode characters in handles", async () => {
      await checkHandle("did:plc:user1", "spam-账户-🤖", Date.now());

      expect(createAccountReport).toHaveBeenCalled();
    });
  });

  describe("timestamp handling", () => {
    it("should include timestamp in action comments", async () => {
      const time = 1234567890;
      await checkHandle("did:plc:user1", "spam-account", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        "1234567890: Spam detected - spam-account",
      );
    });

    it("should handle different timestamp formats", async () => {
      const time = Date.now();
      await checkHandle("did:plc:user1", "spam-account", time);

      expect(createAccountReport).toHaveBeenCalledWith(
        "did:plc:user1",
        expect.stringContaining(time.toString()),
      );
    });
  });

  describe("whitelist and ignoredDIDs combination", () => {
    it("should respect both whitelist and ignoredDIDs", async () => {
      await checkHandle("did:plc:testuser", "good-test-account", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
    });

    it("should skip on ignoredDID even if not whitelisted", async () => {
      await checkHandle("did:plc:testuser", "bad-test-account", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
    });

    it("should skip on whitelist even if not in ignoredDIDs", async () => {
      await checkHandle("did:plc:otheruser", "good-test-account", Date.now());

      expect(createAccountReport).not.toHaveBeenCalled();
    });
  });
});
