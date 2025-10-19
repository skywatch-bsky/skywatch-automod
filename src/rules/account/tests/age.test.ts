import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateAccountAge,
  checkAccountAge,
  getAccountCreationDate,
} from "../age.js";
import { ACCOUNT_AGE_CHECKS } from "../ageConstants.js";

// Mock dependencies
vi.mock("../../../agent.js", () => ({
  agent: {
    getProfile: vi.fn(),
  },
  isLoggedIn: Promise.resolve(true),
}));

vi.mock("../../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../moderation.js", () => ({
  createAccountLabel: vi.fn(),
  checkAccountLabels: vi.fn(),
}));

vi.mock("../../../constants.js", () => ({
  GLOBAL_ALLOW: [],
}));

// Mock fetch for DID document lookups
global.fetch = vi.fn();

import { agent } from "../../../agent.js";
import { logger } from "../../../logger.js";
import { createAccountLabel, checkAccountLabels } from "../../../moderation.js";
import { GLOBAL_ALLOW } from "../../../constants.js";

describe("Account Age Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateAccountAge", () => {
    it("should calculate age in days correctly", () => {
      const creationDate = new Date("2025-01-01");
      const referenceDate = new Date("2025-01-08");

      const age = calculateAccountAge(creationDate, referenceDate);

      expect(age).toBe(7);
    });

    it("should return 0 for same day", () => {
      const date = new Date("2025-01-15");

      const age = calculateAccountAge(date, date);

      expect(age).toBe(0);
    });

    it("should handle accounts created before reference date", () => {
      const creationDate = new Date("2024-01-01");
      const referenceDate = new Date("2025-01-01");

      const age = calculateAccountAge(creationDate, referenceDate);

      expect(age).toBe(366); // 2024 is leap year
    });

    it("should return negative for accounts created after reference date", () => {
      const creationDate = new Date("2025-01-15");
      const referenceDate = new Date("2025-01-01");

      const age = calculateAccountAge(creationDate, referenceDate);

      expect(age).toBe(-14);
    });
  });

  describe("getAccountCreationDate", () => {
    it("should fetch creation date from plc directory for plc DIDs", async () => {
      const mockDidDoc = [
        {
          createdAt: "2025-01-10T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      const result = await getAccountCreationDate("did:plc:test123");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://plc.directory/did:plc:test123/log/audit",
      );
      expect(result).toEqual(new Date("2025-01-10T12:00:00.000Z"));
    });

    it("should fall back to profile.createdAt if plc lookup fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      (agent.getProfile as any).mockResolvedValueOnce({
        data: {
          createdAt: "2025-01-12T10:00:00.000Z",
        },
      });

      const result = await getAccountCreationDate("did:plc:test456");

      expect(result).toEqual(new Date("2025-01-12T10:00:00.000Z"));
    });

    it("should return null if both plc and profile fail", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      (agent.getProfile as any).mockResolvedValueOnce({
        data: {},
      });

      const result = await getAccountCreationDate("did:plc:unknown");

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      (agent.getProfile as any).mockResolvedValueOnce({
        data: {},
      });

      const result = await getAccountCreationDate("did:plc:error");

      expect(result).toBeNull();
      // Should log debug/warn when handling expected errors, not error
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe("checkAccountAge", () => {
    const TEST_TIME = Date.now() * 1000;
    const TEST_REPLY_URI = "at://did:plc:replier123/app.bsky.feed.post/xyz";

    beforeEach(() => {
      // Clear the ACCOUNT_AGE_CHECKS array and add test config
      ACCOUNT_AGE_CHECKS.length = 0;
      // Clear the GLOBAL_ALLOW array
      GLOBAL_ALLOW.length = 0;
    });

    it("should skip if no checks configured", async () => {
      await checkAccountAge({
        actorDid: "did:plc:replier",
        replyToDid: "did:plc:monitored",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should skip if reply is not to monitored DID", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored1"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
      });

      await checkAccountAge({
        actorDid: "did:plc:replier",
        replyToDid: "did:plc:other",
        replyingDid: "did:plc:replier",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    describe("when checking a date window", () => {
      beforeEach(() => {
        ACCOUNT_AGE_CHECKS.push({
          monitoredDIDs: ["did:plc:monitored"],
          anchorDate: "2025-10-15",
          maxAgeDays: 7, // Window is inclusive: Oct 15 -> Oct 22
          label: "window-reply",
          comment: "Account created in window",
        });
      });

      it("should label account created within the monitored window", async () => {
        const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDidDoc,
        });

        await checkAccountAge({
          actorDid: "did:plc:inwindow",
          replyToDid: "did:plc:monitored",
          replyingDid: "did:plc:inwindow",
          atURI: TEST_REPLY_URI,
          time: TEST_TIME,
        });

        expect(createAccountLabel).toHaveBeenCalledWith(
          "did:plc:inwindow",
          "window-reply",
          expect.stringContaining("Account created within monitored range"),
        );
      });

      it("should not label account created before the window", async () => {
        const mockDidDoc = [{ createdAt: "2025-10-14T23:59:59.999Z" }];
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDidDoc,
        });

        await checkAccountAge({
          actorDid: "did:plc:beforewindow",
          replyToDid: "did:plc:monitored",
          replyingDid: "did:plc:beforewindow",
          atURI: TEST_REPLY_URI,
          time: TEST_TIME,
        });

        expect(createAccountLabel).not.toHaveBeenCalled();
      });

      it("should not label account created after the window", async () => {
        const mockDidDoc = [{ createdAt: "2025-10-23T00:00:00.000Z" }];
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDidDoc,
        });

        await checkAccountAge({
          actorDid: "did:plc:afterwindow",
          replyToDid: "did:plc:monitored",
          replyingDid: "did:plc:afterwindow",
          atURI: TEST_REPLY_URI,
          time: TEST_TIME,
        });

        expect(createAccountLabel).not.toHaveBeenCalled();
      });

      it("should label account created on the first moment of the window", async () => {
        const mockDidDoc = [{ createdAt: "2025-10-15T00:00:00.000Z" }];
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDidDoc,
        });

        await checkAccountAge({
          actorDid: "did:plc:startofwindow",
          replyToDid: "did:plc:monitored",
          replyingDid: "did:plc:startofwindow",
          atURI: TEST_REPLY_URI,
          time: TEST_TIME,
        });

        expect(createAccountLabel).toHaveBeenCalled();
      });

      it("should label account created on the last moment of the window", async () => {
        const mockDidDoc = [{ createdAt: "2025-10-22T23:59:59.999Z" }];
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDidDoc,
        });

        await checkAccountAge({
          actorDid: "did:plc:endofwindow",
          replyToDid: "did:plc:monitored",
          replyingDid: "did:plc:endofwindow",
          atURI: TEST_REPLY_URI,
          time: TEST_TIME,
        });

        expect(createAccountLabel).toHaveBeenCalled();
      });
    });

    it("should skip if creation date cannot be determined", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account reply",
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      (agent.getProfile as any).mockResolvedValueOnce({
        data: {},
      });

      await checkAccountAge({
        actorDid: "did:plc:unknown",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:unknown",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should only apply one label per reply", async () => {
      // Add overlapping configurations
      ACCOUNT_AGE_CHECKS.push(
        {
          monitoredDIDs: ["did:plc:monitored"],
          anchorDate: "2025-10-15",
          maxAgeDays: 7, // Oct 15-22
          label: "label1",
          comment: "First check",
        },
        {
          monitoredDIDs: ["did:plc:monitored"],
          anchorDate: "2025-10-10",
          maxAgeDays: 20, // Oct 10-30
          label: "label2",
          comment: "Second check",
        },
      );

      // Created Oct 18, matches both windows
      const mockDidDoc = [
        {
          createdAt: "2025-10-18T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      // Should only call once (first matching check)
      expect(createAccountLabel).toHaveBeenCalledOnce();
      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "label1",
        expect.any(String),
      );
    });

    it("should skip labeling if label already exists on account", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label already exists
      (checkAccountLabels as any).mockResolvedValueOnce(true);

      await checkAccountAge({
        actorDid: "did:plc:alreadylabeled",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:alreadylabeled",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(checkAccountLabels).toHaveBeenCalledWith(
        "did:plc:alreadylabeled",
        "window-reply",
      );
      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "ACCOUNT_AGE",
          actorDid: "did:plc:alreadylabeled",
          label: "window-reply",
        },
        "Label already exists, skipping duplicate",
      );
    });

    it("should create label if it does not already exist", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:newlabel",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newlabel",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(checkAccountLabels).toHaveBeenCalledWith(
        "did:plc:newlabel",
        "window-reply",
      );
      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newlabel",
        "window-reply",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should skip if replying DID is globally allowlisted", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account reply",
      });

      // Add replying DID to global allowlist
      GLOBAL_ALLOW.push("did:plc:allowlisted");

      await checkAccountAge({
        actorDid: "did:plc:allowlisted",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:allowlisted",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "ACCOUNT_AGE",
          did: "did:plc:allowlisted",
          atURI: TEST_REPLY_URI,
        },
        "Global allowlisted DID",
      );
    });

    it("should skip if check has expired", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
        expires: "2025-10-01", // Already expired
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        { process: "ACCOUNT_AGE", expires: "2025-10-01" },
        "Check has expired, skipping",
      );
    });

    it("should apply label if check has not expired", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
        expires: "2026-01-01", // Future date
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "window-reply",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should apply label if no expires field is set", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "Account created in window",
        // No expires field
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "window-reply",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should label account when reply is to a monitored post URI", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredPostURIs: [
          "at://did:plc:monitored/app.bsky.feed.post/specificpost",
        ],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "brigading-suspect",
        comment: "New account replying to targeted post",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:someone",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
        replyToPostURI:
          "at://did:plc:monitored/app.bsky.feed.post/specificpost",
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "brigading-suspect",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should not label when reply is to different post URI", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredPostURIs: [
          "at://did:plc:monitored/app.bsky.feed.post/specificpost",
        ],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "brigading-suspect",
        comment: "New account replying to targeted post",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:someone",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
        replyToPostURI: "at://did:plc:other/app.bsky.feed.post/differentpost",
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should match either monitored DID or post URI", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored1"],
        monitoredPostURIs: [
          "at://did:plc:monitored2/app.bsky.feed.post/specificpost",
        ],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "multi-monitor",
        comment: "New account replying to monitored target",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      // Test matching by post URI even though DID doesn't match
      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:someone-else",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
        replyToPostURI:
          "at://did:plc:monitored2/app.bsky.feed.post/specificpost",
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "multi-monitor",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should work without replyToPostURI (backward compatibility)", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "window-reply",
        comment: "New account reply",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:newaccount",
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
        // No replyToPostURI provided
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "window-reply",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should label account when quoting a monitored DID", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "quote-brigading",
        comment: "New account quote-posting monitored user",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:quoter",
        quotedDid: "did:plc:monitored",
        atURI: "at://did:plc:quoter/app.bsky.feed.post/quote123",
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:quoter",
        "quote-brigading",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should label account when quoting a monitored post URI", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredPostURIs: ["at://did:plc:target/app.bsky.feed.post/targeted"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "brigading-suspect",
        comment: "New account quoting targeted post",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      await checkAccountAge({
        actorDid: "did:plc:quoter",
        quotedPostURI: "at://did:plc:target/app.bsky.feed.post/targeted",
        atURI: "at://did:plc:quoter/app.bsky.feed.post/quote456",
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:quoter",
        "brigading-suspect",
        expect.stringContaining("Account created within monitored range"),
      );
    });

    it("should not label when quoting different DID", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "quote-brigading",
        comment: "New account quote-posting",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        actorDid: "did:plc:quoter",
        quotedDid: "did:plc:different",
        atURI: "at://did:plc:quoter/app.bsky.feed.post/quote789",
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should match either reply or quote to monitored DID", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-10-15",
        maxAgeDays: 7,
        label: "interaction-suspect",
        comment: "New account interacting with monitored user",
      });

      // Mock account created within window
      const mockDidDoc = [{ createdAt: "2025-10-18T12:00:00.000Z" }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Mock that label does NOT exist
      (checkAccountLabels as any).mockResolvedValueOnce(false);

      // Test quote (not reply) to monitored DID
      await checkAccountAge({
        actorDid: "did:plc:actor",
        quotedDid: "did:plc:monitored",
        atURI: "at://did:plc:actor/app.bsky.feed.post/interaction",
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:actor",
        "interaction-suspect",
        expect.stringContaining("Account created within monitored range"),
      );
    });
  });
});
