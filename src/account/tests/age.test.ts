import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateAccountAge,
  checkAccountAge,
  getAccountCreationDate,
} from "../age.js";
import { ACCOUNT_AGE_CHECKS } from "../ageConstants.js";

// Mock dependencies
vi.mock("../../agent.js", () => ({
  agent: {
    getProfile: vi.fn(),
  },
  isLoggedIn: Promise.resolve(true),
}));

vi.mock("../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../moderation.js", () => ({
  createAccountLabel: vi.fn(),
}));

// Mock fetch for DID document lookups
global.fetch = vi.fn();

import { agent } from "../../agent.js";
import { logger } from "../../logger.js";
import { createAccountLabel } from "../../moderation.js";

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
        "https://plc.wtf/did:plc:test123",
      );
      expect(result).toEqual(new Date("2025-01-10T12:00:00.000Z"));
    });

    it("should fall back to profile.indexedAt if plc lookup fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      (agent.getProfile as any).mockResolvedValueOnce({
        data: {
          indexedAt: "2025-01-12T10:00:00.000Z",
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
    });

    it("should skip if no checks configured", async () => {
      await checkAccountAge({
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:replier",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should skip if reply is not to monitored DID", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored1"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account reply",
      });

      await checkAccountAge({
        replyToDid: "did:plc:other",
        replyingDid: "did:plc:replier",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should label account if too new", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account replying during campaign",
      });

      // Mock account created on Jan 12 noon (2.5 days before anchor at midnight = 2 days floored)
      const mockDidDoc = [
        {
          createdAt: "2025-01-12T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "new-account-reply",
        expect.stringContaining("Account age: 2 days"),
      );
    });

    it("should not label account if old enough", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account reply",
      });

      // Mock account created on Jan 5 (10 days before anchor)
      const mockDidDoc = [
        {
          createdAt: "2025-01-05T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        replyToDid: "did:plc:monitored",
        replyingDid: "did:plc:oldaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).not.toHaveBeenCalled();
    });

    it("should handle multiple monitored DIDs", async () => {
      ACCOUNT_AGE_CHECKS.push({
        monitoredDIDs: ["did:plc:monitored1", "did:plc:monitored2"],
        anchorDate: "2025-01-15",
        maxAgeDays: 7,
        label: "new-account-reply",
        comment: "New account reply",
      });

      const mockDidDoc = [
        {
          createdAt: "2025-01-14T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
        replyToDid: "did:plc:monitored2",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledOnce();
    });

    it("should handle multiple check configurations", async () => {
      ACCOUNT_AGE_CHECKS.push(
        {
          monitoredDIDs: ["did:plc:monitored1"],
          anchorDate: "2025-01-15",
          maxAgeDays: 7,
          label: "new-account-campaign1",
          comment: "Campaign 1",
        },
        {
          monitoredDIDs: ["did:plc:monitored2"],
          anchorDate: "2025-02-01",
          maxAgeDays: 14,
          label: "new-account-campaign2",
          comment: "Campaign 2",
        },
      );

      const mockDidDoc = [
        {
          createdAt: "2025-01-20T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      // Reply to monitored2 - account created Jan 20 noon, checked against Feb 1 midnight (11.5 days = 11 floored)
      await checkAccountAge({
        replyToDid: "did:plc:monitored2",
        replyingDid: "did:plc:newaccount",
        atURI: TEST_REPLY_URI,
        time: TEST_TIME,
      });

      expect(createAccountLabel).toHaveBeenCalledWith(
        "did:plc:newaccount",
        "new-account-campaign2",
        expect.stringContaining("Account age: 11 days"),
      );
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
          anchorDate: "2025-01-15",
          maxAgeDays: 7,
          label: "label1",
          comment: "First check",
        },
        {
          monitoredDIDs: ["did:plc:monitored"],
          anchorDate: "2025-01-15",
          maxAgeDays: 14,
          label: "label2",
          comment: "Second check",
        },
      );

      const mockDidDoc = [
        {
          createdAt: "2025-01-14T12:00:00.000Z",
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDidDoc,
      });

      await checkAccountAge({
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
  });
});
