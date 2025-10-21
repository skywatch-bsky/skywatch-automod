 
 
 
 
 
 
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAccountComment,
  createAccountLabel,
  createAccountReport,
} from "../../../accountModeration.js";
import { logger } from "../../../logger.js";
import { getLanguage } from "../../../utils/getLanguage.js";
import { checkDescription, checkDisplayName } from "../checkProfiles.js";

// Mock dependencies
vi.mock("../../../../rules/profiles.js", () => ({
  PROFILE_CHECKS: [
    {
      label: "test-description",
      comment: "Test description check",
      description: true,
      displayName: false,
      check: /spam|scam/i,
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "test-displayname",
      comment: "Test display name check",
      description: false,
      displayName: true,
      check: /fake|bot/i,
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "language-specific",
      comment: "English only test",
      language: ["eng"],
      description: true,
      displayName: false,
      check: /hello/i,
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "whitelisted-test",
      comment: "Has whitelist",
      description: true,
      displayName: false,
      check: /bad/i,
      whitelist: /good bad/i,
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "ignored-did",
      comment: "Ignored DID test",
      description: true,
      displayName: false,
      check: /test/i,
      ignoredDIDs: ["did:plc:ignored123"],
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "all-actions",
      comment: "All actions enabled",
      description: true,
      displayName: false,
      check: /report/i,
      toLabel: true,
      reportAcct: true,
      commentAcct: true,
    },
    {
      label: "both-fields",
      comment: "Check both description and displayName",
      description: true,
      displayName: true,
      check: /suspicious/i,
      toLabel: true,
      reportAcct: false,
      commentAcct: false,
    },
  ],
}));

vi.mock("../../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../accountModeration.js", () => ({
  createAccountLabel: vi.fn(),
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
}));

vi.mock("../../../utils/getLanguage.js", () => ({
  getLanguage: vi.fn().mockResolvedValue("eng"),
}));

vi.mock("../../../../rules/constants.js", () => ({
  GLOBAL_ALLOW: ["did:plc:globalallow"],
}));

describe("checkProfiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDid = "did:plc:test123";
  const mockTime = Date.now() * 1000;
  const mockDisplayName = "Test User";
  const mockDescription = "This is a test description";

  describe("checkDescription", () => {
    describe("Global allow list", () => {
      it("should skip profiles from globally allowed DIDs", async () => {
        await checkDescription(
          "did:plc:globalallow",
          mockTime,
          mockDisplayName,
          mockDescription,
        );

        expect(logger.warn).toHaveBeenCalledWith(
          {
            process: "CHECKDESCRIPTION",
            did: "did:plc:globalallow",
            time: mockTime,
            displayName: mockDisplayName,
            description: mockDescription,
          },
          "Global AllowListed DID",
        );
        expect(createAccountLabel).not.toHaveBeenCalled();
      });

      it("should process non-globally-allowed DIDs", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "spam content",
        );

        expect(logger.warn).not.toHaveBeenCalledWith(
          expect.objectContaining({ did: mockDid }),
          "Global AllowListed DID",
        );
      });
    });

    describe("Pattern matching and labeling", () => {
      it("should label profiles with matching descriptions", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "This is spam content",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "test-description",
          expect.stringContaining("Test description check"),
        );
      });

      it("should not label profiles without matching descriptions", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "Normal content",
        );

        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "test-description",
          expect.any(String),
        );
      });

      it("should not check description when description field is false", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          "fake account",
          mockDescription,
        );

        // test-displayname has displayName: true, description: false
        // so it should not trigger on description content
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "test-displayname",
          expect.any(String),
        );
      });

      it("should handle empty description", async () => {
        await checkDescription(mockDid, mockTime, mockDisplayName, "");

        expect(createAccountLabel).not.toHaveBeenCalled();
      });
    });

    describe("Language filtering", () => {
      it("should check language-specific patterns for matching languages", async () => {
        vi.mocked(getLanguage).mockResolvedValue("eng");

        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "hello world",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "language-specific",
          expect.any(String),
        );
      });

      it("should skip language-specific patterns for non-matching languages", async () => {
        vi.mocked(getLanguage).mockResolvedValue("spa");

        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "hello world",
        );

        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "language-specific",
          expect.any(String),
        );
      });
    });

    describe("Whitelist handling", () => {
      it("should skip patterns when whitelist matches", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "this is good bad content",
        );

        expect(logger.debug).toHaveBeenCalledWith(
          {
            process: "CHECKDESCRIPTION",
            did: mockDid,
            time: mockTime,
            displayName: mockDisplayName,
            description: "this is good bad content",
          },
          "Whitelisted phrase found",
        );
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "whitelisted-test",
          expect.any(String),
        );
      });

      it("should label when pattern matches but whitelist doesn't", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "just bad content",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "whitelisted-test",
          expect.any(String),
        );
      });
    });

    describe("Ignored DIDs", () => {
      it("should skip checks for ignored DIDs", async () => {
        await checkDescription(
          "did:plc:ignored123",
          mockTime,
          mockDisplayName,
          "test content",
        );

        expect(logger.debug).toHaveBeenCalledWith(
          {
            process: "CHECKDESCRIPTION",
            did: "did:plc:ignored123",
            time: mockTime,
            displayName: mockDisplayName,
            description: "test content",
          },
          "Whitelisted DID",
        );
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          "did:plc:ignored123",
          "ignored-did",
          expect.any(String),
        );
      });

      it("should check non-ignored DIDs", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "test content",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "ignored-did",
          expect.any(String),
        );
      });
    });

    describe("Moderation actions", () => {
      it("should execute all moderation actions when enabled", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "report this content",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "all-actions",
          expect.any(String),
        );
        expect(createAccountReport).toHaveBeenCalledWith(
          mockDid,
          expect.any(String),
        );
        expect(createAccountComment).toHaveBeenCalledWith(
          mockDid,
          expect.any(String),
          expect.any(String),
        );
      });
    });
  });

  describe("checkDisplayName", () => {
    describe("Global allow list", () => {
      it("should skip profiles from globally allowed DIDs", async () => {
        await checkDisplayName(
          "did:plc:globalallow",
          mockTime,
          mockDisplayName,
          mockDescription,
        );

        expect(logger.warn).toHaveBeenCalledWith(
          {
            process: "CHECKDISPLAYNAME",
            did: "did:plc:globalallow",
            time: mockTime,
            displayName: mockDisplayName,
            description: mockDescription,
          },
          "Global AllowListed DID",
        );
        expect(createAccountLabel).not.toHaveBeenCalled();
      });

      it("should process non-globally-allowed DIDs", async () => {
        await checkDisplayName(mockDid, mockTime, "fake user", mockDescription);

        expect(logger.warn).not.toHaveBeenCalledWith(
          expect.objectContaining({ did: mockDid }),
          "Global AllowListed DID",
        );
      });
    });

    describe("Pattern matching and labeling", () => {
      it("should label profiles with matching display names", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          "fake account",
          mockDescription,
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "test-displayname",
          expect.stringContaining("Test display name check"),
        );
      });

      it("should not label profiles without matching display names", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          "Normal User",
          mockDescription,
        );

        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "test-displayname",
          expect.any(String),
        );
      });

      it("should not check displayName when displayName field is false", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          mockDisplayName,
          "spam description",
        );

        // test-description has description: true, displayName: false
        // so it should not trigger on displayName content
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "test-description",
          expect.any(String),
        );
      });

      it("should handle empty display name", async () => {
        await checkDisplayName(mockDid, mockTime, "", mockDescription);

        expect(createAccountLabel).not.toHaveBeenCalled();
      });
    });

    describe("Language filtering", () => {
      it("should check language-specific patterns for matching languages", async () => {
        vi.mocked(getLanguage).mockResolvedValue("eng");

        await checkDisplayName(mockDid, mockTime, "hello world", "description");

        // language-specific check has description: true, displayName: false
        // so it won't match on displayName
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "language-specific",
          expect.any(String),
        );
      });

      it("should skip language-specific patterns for non-matching languages", async () => {
        vi.mocked(getLanguage).mockResolvedValue("spa");

        await checkDisplayName(mockDid, mockTime, "hello", mockDescription);

        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "language-specific",
          expect.any(String),
        );
      });
    });

    describe("Whitelist handling", () => {
      it("should skip patterns when whitelist matches", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          "good bad user",
          mockDescription,
        );

        // whitelisted-test has description: true, displayName: false
        // so it won't trigger on displayName
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "whitelisted-test",
          expect.any(String),
        );
      });
    });

    describe("Ignored DIDs", () => {
      it("should skip checks for ignored DIDs", async () => {
        await checkDisplayName(
          "did:plc:ignored123",
          mockTime,
          "test user",
          mockDescription,
        );

        expect(logger.debug).toHaveBeenCalledWith(
          {
            process: "CHECKDISPLAYNAME",
            did: "did:plc:ignored123",
            time: mockTime,
            displayName: "test user",
            description: mockDescription,
          },
          "Whitelisted DID",
        );
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          "did:plc:ignored123",
          "ignored-did",
          expect.any(String),
        );
      });

      it("should check non-ignored DIDs", async () => {
        await checkDisplayName(mockDid, mockTime, "test user", mockDescription);

        // ignored-did has description: true, displayName: false
        // so it won't trigger on displayName
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "ignored-did",
          expect.any(String),
        );
      });
    });

    describe("Moderation actions", () => {
      it("should execute all moderation actions when enabled", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          mockDisplayName,
          "report this content",
        );

        // all-actions has description: true, displayName: false
        // so it won't match on displayName
        expect(createAccountLabel).not.toHaveBeenCalledWith(
          mockDid,
          "all-actions",
          expect.any(String),
        );
      });
    });

    describe("Both fields check", () => {
      it("should check displayName when both fields are enabled", async () => {
        await checkDisplayName(
          mockDid,
          mockTime,
          "suspicious user",
          mockDescription,
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "both-fields",
          expect.any(String),
        );
      });

      it("should check description when both fields are enabled", async () => {
        await checkDescription(
          mockDid,
          mockTime,
          mockDisplayName,
          "suspicious content",
        );

        expect(createAccountLabel).toHaveBeenCalledWith(
          mockDid,
          "both-fields",
          expect.any(String),
        );
      });
    });
  });
});
