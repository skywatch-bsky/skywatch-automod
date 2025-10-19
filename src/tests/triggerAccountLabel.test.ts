import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AccountLabelAction } from "../trackPostLabel.js";

// Mock dependencies
vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../moderation.js", () => ({
  createAccountLabel: vi.fn(),
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
}));

// Import after mocks
import { triggerAccountLabel } from "../triggerAccountLabel.js";
import { logger } from "../logger.js";
import {
  createAccountLabel,
  createAccountReport,
  createAccountComment,
} from "../moderation.js";

describe("triggerAccountLabel", () => {
  const testDid = "did:plc:test123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("label only (minimal config)", () => {
    const action: AccountLabelAction = {
      type: "label-account",
      did: testDid,
      config: {
        label: "spam",
        threshold: 5,
        accountLabel: "repeat-spammer",
        accountComment: "Account has posted spam multiple times",
      },
      currentCount: 5,
    };

    it("should label account successfully", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: true,
        did: testDid,
        label: "repeat-spammer",
        labeled: true,
        reported: undefined,
        commented: undefined,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "repeat-spammer",
        "Account has posted spam multiple times",
      );
      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should log success messages", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);

      await triggerAccountLabel(action);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRIGGER_ACCOUNT_LABEL",
          did: testDid,
          postLabel: "spam",
          accountLabel: "repeat-spammer",
        }),
        expect.stringContaining("Triggering account label"),
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          labeled: true,
        }),
        expect.stringContaining("Successfully executed"),
      );
    });
  });

  describe("label + report", () => {
    const action: AccountLabelAction = {
      type: "label-account",
      did: testDid,
      config: {
        label: "scam",
        threshold: 3,
        accountLabel: "repeat-scammer",
        accountComment: "Account has posted scam content multiple times",
        reportAcct: true,
      },
      currentCount: 4,
    };

    it("should label and report account", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: true,
        did: testDid,
        label: "repeat-scammer",
        labeled: true,
        reported: true,
        commented: undefined,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "repeat-scammer",
        "Account has posted scam content multiple times",
      );
      expect(createAccountReport).toHaveBeenCalledWith(
        testDid,
        "Account has posted scam content multiple times",
      );
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should log report action", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockResolvedValue(undefined);

      await triggerAccountLabel(action);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRIGGER_ACCOUNT_LABEL",
          did: testDid,
        }),
        expect.stringContaining("Reported account"),
      );
    });
  });

  describe("label + comment", () => {
    const action: AccountLabelAction = {
      type: "label-account",
      did: testDid,
      config: {
        label: "misinformation",
        threshold: 10,
        accountLabel: "frequent-misinfo",
        accountComment: "Account frequently posts misleading information",
        commentAcct: true,
      },
      currentCount: 12,
    };

    it("should label and comment on account", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountComment).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: true,
        did: testDid,
        label: "frequent-misinfo",
        labeled: true,
        reported: undefined,
        commented: true,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "frequent-misinfo",
        "Account frequently posts misleading information",
      );
      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).toHaveBeenCalledWith(
        testDid,
        "Account frequently posts misleading information",
      );
    });

    it("should log comment action", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountComment).mockResolvedValue(undefined);

      await triggerAccountLabel(action);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRIGGER_ACCOUNT_LABEL",
          did: testDid,
        }),
        expect.stringContaining("Commented on account"),
      );
    });
  });

  describe("label + report + comment (full config)", () => {
    const action: AccountLabelAction = {
      type: "label-account",
      did: testDid,
      config: {
        label: "harassment",
        threshold: 2,
        accountLabel: "repeat-harasser",
        accountComment: "Account has harassed other users multiple times",
        windowDays: 7,
        reportAcct: true,
        commentAcct: true,
      },
      currentCount: 3,
    };

    it("should execute all three actions", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockResolvedValue(undefined);
      vi.mocked(createAccountComment).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: true,
        did: testDid,
        label: "repeat-harasser",
        labeled: true,
        reported: true,
        commented: true,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        testDid,
        "repeat-harasser",
        "Account has harassed other users multiple times",
      );
      expect(createAccountReport).toHaveBeenCalledWith(
        testDid,
        "Account has harassed other users multiple times",
      );
      expect(createAccountComment).toHaveBeenCalledWith(
        testDid,
        "Account has harassed other users multiple times",
      );
    });

    it("should call actions in correct order", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockResolvedValue(undefined);
      vi.mocked(createAccountComment).mockResolvedValue(undefined);

      await triggerAccountLabel(action);

      const callOrder = [
        vi.mocked(createAccountLabel).mock.invocationCallOrder[0],
        vi.mocked(createAccountReport).mock.invocationCallOrder[0],
        vi.mocked(createAccountComment).mock.invocationCallOrder[0],
      ];

      expect(callOrder[0]).toBeLessThan(callOrder[1]);
      expect(callOrder[1]).toBeLessThan(callOrder[2]);
    });
  });

  describe("error handling", () => {
    const action: AccountLabelAction = {
      type: "label-account",
      did: testDid,
      config: {
        label: "spam",
        threshold: 5,
        accountLabel: "repeat-spammer",
        accountComment: "Account has posted spam multiple times",
        reportAcct: true,
        commentAcct: true,
      },
      currentCount: 5,
    };

    it("should handle label error", async () => {
      const error = new Error("Failed to label account");
      vi.mocked(createAccountLabel).mockRejectedValue(error);

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: false,
        did: testDid,
        label: "repeat-spammer",
        error: "Failed to label account",
      });

      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should log error with details", async () => {
      const error = new Error("Ozone API error");
      vi.mocked(createAccountLabel).mockRejectedValue(error);

      await triggerAccountLabel(action);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          process: "TRIGGER_ACCOUNT_LABEL",
          did: testDid,
          label: "repeat-spammer",
          name: "Error",
          message: "Ozone API error",
        }),
        expect.stringContaining("Failed to execute account action"),
      );
    });

    it("should handle non-Error objects", async () => {
      vi.mocked(createAccountLabel).mockRejectedValue("string error");

      const result = await triggerAccountLabel(action);

      expect(result).toEqual({
        success: false,
        did: testDid,
        label: "repeat-spammer",
        error: "string error",
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "string error",
        }),
        expect.any(String),
      );
    });

    it("should fail early if labeling fails (no report/comment attempted)", async () => {
      vi.mocked(createAccountLabel).mockRejectedValue(new Error("Label failed"));

      await triggerAccountLabel(action);

      expect(createAccountLabel).toHaveBeenCalled();
      expect(createAccountReport).not.toHaveBeenCalled();
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should fail if report fails (after successful label)", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockRejectedValue(new Error("Report failed"));

      const result = await triggerAccountLabel(action);

      expect(result.success).toBe(false);
      expect(result.labeled).toBe(true);
      expect(result.reported).toBeUndefined();
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should fail if comment fails (after successful label+report)", async () => {
      vi.mocked(createAccountLabel).mockResolvedValue(undefined);
      vi.mocked(createAccountReport).mockResolvedValue(undefined);
      vi.mocked(createAccountComment).mockRejectedValue(
        new Error("Comment failed"),
      );

      const result = await triggerAccountLabel(action);

      expect(result.success).toBe(false);
      expect(result.labeled).toBe(true);
      expect(result.reported).toBe(true);
      expect(result.commented).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle reportAcct: false explicitly", async () => {
      const action: AccountLabelAction = {
        type: "label-account",
        did: testDid,
        config: {
          label: "spam",
          threshold: 5,
          accountLabel: "repeat-spammer",
          accountComment: "Test comment",
          reportAcct: false,
        },
        currentCount: 5,
      };

      vi.mocked(createAccountLabel).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result.reported).toBeUndefined();
      expect(createAccountReport).not.toHaveBeenCalled();
    });

    it("should handle commentAcct: false explicitly", async () => {
      const action: AccountLabelAction = {
        type: "label-account",
        did: testDid,
        config: {
          label: "spam",
          threshold: 5,
          accountLabel: "repeat-spammer",
          accountComment: "Test comment",
          commentAcct: false,
        },
        currentCount: 5,
      };

      vi.mocked(createAccountLabel).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result.commented).toBeUndefined();
      expect(createAccountComment).not.toHaveBeenCalled();
    });

    it("should handle high currentCount", async () => {
      const action: AccountLabelAction = {
        type: "label-account",
        did: testDid,
        config: {
          label: "spam",
          threshold: 5,
          accountLabel: "repeat-spammer",
          accountComment: "Test",
        },
        currentCount: 999,
      };

      vi.mocked(createAccountLabel).mockResolvedValue(undefined);

      const result = await triggerAccountLabel(action);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          currentCount: 999,
        }),
        expect.any(String),
      );
    });
  });
});
