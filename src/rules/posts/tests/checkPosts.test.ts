import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAccountComment,
  createAccountReport,
} from "../../../accountModeration.js";
import { checkAccountThreshold } from "../../../accountThreshold.js";
import { logger } from "../../../logger.js";
import { createPostLabel, createPostReport } from "../../../moderation.js";
import type { Post } from "../../../types.js";
import { getFinalUrl } from "../../../utils/getFinalUrl.js";
import { getLanguage } from "../../../utils/getLanguage.js";
import { countStarterPacks } from "../../account/countStarterPacks.js";
import { checkPosts } from "../checkPosts.js";

// Mock dependencies
vi.mock("../../../../rules/constants.js", () => ({
  GLOBAL_ALLOW: ["did:plc:globalallow"],
  LINK_SHORTENER: /tinyurl\.com|bit\.ly/i,
}));

vi.mock("../../../../rules/posts.js", () => ({
  POST_CHECKS: [
    {
      label: "test-label",
      comment: "Test comment",
      check: /spam|scam/i,
      toLabel: true,
      reportPost: false,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "language-specific",
      comment: "English only test",
      language: ["eng"],
      check: /hello/i,
      toLabel: true,
      reportPost: false,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "whitelisted-test",
      comment: "Has whitelist",
      check: /bad/i,
      whitelist: /good bad/i,
      toLabel: true,
      reportPost: false,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "ignored-did",
      comment: "Ignored DID test",
      check: /test/i,
      ignoredDIDs: ["did:plc:ignored123"],
      toLabel: true,
      reportPost: false,
      reportAcct: false,
      commentAcct: false,
    },
    {
      label: "all-actions",
      comment: "All actions enabled",
      check: /report/i,
      toLabel: true,
      reportPost: true,
      reportAcct: true,
      commentAcct: true,
    },
    {
      label: "track-only-label",
      comment: "Track only test",
      check: /shopping/i,
      toLabel: false,
      trackOnly: true,
      reportPost: false,
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

vi.mock("../../account/countStarterPacks.js", () => ({
  countStarterPacks: vi.fn(),
}));

vi.mock("../../../accountModeration.js", () => ({
  createAccountReport: vi.fn(),
  createAccountComment: vi.fn(),
}));

vi.mock("../../../accountThreshold.js", () => ({
  checkAccountThreshold: vi.fn(),
}));

vi.mock("../../../moderation.js", () => ({
  createPostLabel: vi.fn(),
  createPostReport: vi.fn(),
}));

vi.mock("../../../utils/getLanguage.js", () => ({
  getLanguage: vi.fn().mockResolvedValue("eng"),
}));

vi.mock("../../../utils/getFinalUrl.js", () => ({
  getFinalUrl: vi.fn(),
}));

describe("checkPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockPost = (overrides?: Partial<Post>): Post[] => [
    {
      did: "did:plc:test123",
      time: Date.now() * 1000,
      rkey: "test-rkey",
      atURI: "at://did:plc:test123/app.bsky.feed.post/test-rkey",
      text: "This is a test post",
      cid: "test-cid",
      ...overrides,
    },
  ];

  describe("Global allow list", () => {
    it("should skip posts from globally allowed DIDs", async () => {
      const post = createMockPost({ did: "did:plc:globalallow" });

      await checkPosts(post);

      expect(logger.warn).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          did: "did:plc:globalallow",
          atURI: post[0].atURI,
        },
        "Global AllowListed DID",
      );
      expect(createPostLabel).not.toHaveBeenCalled();
    });

    it("should process posts from non-globally-allowed DIDs", async () => {
      const post = createMockPost({ text: "spam post" });

      await checkPosts(post);

      expect(logger.warn).not.toHaveBeenCalledWith(
        expect.objectContaining({ did: post[0].did }),
        "Global AllowListed DID",
      );
    });
  });

  describe("URL shortener resolution", () => {
    it("should resolve shortened URLs", async () => {
      const post = createMockPost({
        text: "Check this out https://tinyurl.com/test123",
      });
      vi.mocked(getFinalUrl).mockResolvedValue("https://example.com/full-url");

      await checkPosts(post);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          url: "https://tinyurl.com/test123",
          did: post[0].did,
        },
        "Resolving shortened URL",
      );
      expect(getFinalUrl).toHaveBeenCalledWith("https://tinyurl.com/test123");
      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          originalUrl: "https://tinyurl.com/test123",
          resolvedUrl: "https://example.com/full-url",
          did: post[0].did,
        },
        "Shortened URL resolved",
      );
      expect(post[0].text).toBe("Check this out https://example.com/full-url");
    });

    it("should not replace URL if resolution returns same URL", async () => {
      const post = createMockPost({ text: "Check https://tinyurl.com/test" });
      vi.mocked(getFinalUrl).mockResolvedValue("https://tinyurl.com/test");

      await checkPosts(post);

      expect(getFinalUrl).toHaveBeenCalled();
      expect(post[0].text).toBe("Check https://tinyurl.com/test");
      expect(logger.debug).not.toHaveBeenCalledWith(
        expect.objectContaining({ originalUrl: expect.anything() }),
        "Shortened URL resolved",
      );
    });

    it("should handle URL resolution errors gracefully", async () => {
      const post = createMockPost({ text: "https://tinyurl.com/broken" });
      const error = new Error("Network timeout");
      vi.mocked(getFinalUrl).mockRejectedValue(error);

      await checkPosts(post);

      expect(logger.error).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          text: post[0].text,
          did: post[0].did,
          atURI: post[0].atURI,
          name: error.name,
          message: error.message,
        },
        "Failed to resolve shortened URL",
      );
      expect(post[0].text).toBe("https://tinyurl.com/broken");
    });

    it("should handle non-Error exceptions during URL resolution", async () => {
      const post = createMockPost({ text: "https://bit.ly/test" });
      const error = "String error";
      vi.mocked(getFinalUrl).mockRejectedValue(error);

      await checkPosts(post);

      expect(logger.error).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          text: post[0].text,
          did: post[0].did,
          atURI: post[0].atURI,
          error: String(error),
        },
        "Failed to resolve shortened URL",
      );
    });

    it("should not attempt to resolve non-shortened URLs", async () => {
      const post = createMockPost({ text: "Normal https://example.com URL" });

      await checkPosts(post);

      expect(getFinalUrl).not.toHaveBeenCalled();
    });
  });

  describe("Pattern matching and labeling", () => {
    it("should label posts matching check patterns", async () => {
      const post = createMockPost({ text: "This is spam content" });

      await checkPosts(post);

      expect(createPostLabel).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        "test-label",
        expect.stringContaining("Test comment"),
        undefined,
        post[0].did,
        post[0].time,
      );
    });

    it("should not label posts that don't match patterns", async () => {
      const post = createMockPost({ text: "Totally normal content" });

      await checkPosts(post);

      expect(createPostLabel).not.toHaveBeenCalled();
    });

    it("should call countStarterPacks when pattern matches", async () => {
      const post = createMockPost({ text: "spam message" });

      await checkPosts(post);

      expect(countStarterPacks).toHaveBeenCalledWith(post[0].did, post[0].time);
    });
  });

  describe("Language filtering", () => {
    it("should only check language-specific patterns for matching languages", async () => {
      const post = createMockPost({ text: "hello world" });
      vi.mocked(getLanguage).mockResolvedValue("eng");

      await checkPosts(post);

      expect(createPostLabel).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        "language-specific",
        expect.any(String),
        undefined,
        post[0].did,
        post[0].time,
      );
    });

    it("should skip language-specific patterns for non-matching languages", async () => {
      const post = createMockPost({ text: "hello world" });
      vi.mocked(getLanguage).mockResolvedValue("spa");

      await checkPosts(post);

      expect(createPostLabel).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "language-specific",
        expect.any(String),
        undefined,
      );
    });
  });

  describe("Whitelist handling", () => {
    it("should skip patterns when whitelist matches", async () => {
      const post = createMockPost({ text: "this is good bad content" });

      await checkPosts(post);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          did: post[0].did,
          atURI: post[0].atURI,
        },
        "Whitelisted phrase found",
      );
      expect(createPostLabel).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "whitelisted-test",
        expect.any(String),
        undefined,
      );
    });

    it("should label when pattern matches but whitelist doesn't", async () => {
      const post = createMockPost({ text: "just bad content" });

      await checkPosts(post);

      expect(createPostLabel).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        "whitelisted-test",
        expect.any(String),
        undefined,
        post[0].did,
        post[0].time,
      );
    });
  });

  describe("Ignored DIDs", () => {
    it("should skip checks for ignored DIDs", async () => {
      const post = createMockPost({
        did: "did:plc:ignored123",
        text: "test content",
      });

      await checkPosts(post);

      expect(logger.debug).toHaveBeenCalledWith(
        {
          process: "CHECKPOSTS",
          did: "did:plc:ignored123",
          atURI: post[0].atURI,
        },
        "Whitelisted DID",
      );
      expect(createPostLabel).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "ignored-did",
        expect.any(String),
        undefined,
      );
    });

    it("should check non-ignored DIDs", async () => {
      const post = createMockPost({
        did: "did:plc:notignored",
        text: "test content",
      });

      await checkPosts(post);

      expect(createPostLabel).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        "ignored-did",
        expect.any(String),
        undefined,
        "did:plc:notignored",
        post[0].time,
      );
    });
  });

  describe("Moderation actions", () => {
    it("should execute all moderation actions when enabled", async () => {
      const post = createMockPost({ text: "report this content" });

      await checkPosts(post);

      expect(createPostLabel).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        "all-actions",
        expect.any(String),
        undefined,
        post[0].did,
        post[0].time,
      );
      expect(createPostReport).toHaveBeenCalledWith(
        post[0].atURI,
        post[0].cid,
        expect.any(String),
      );
      expect(createAccountReport).toHaveBeenCalledWith(
        post[0].did,
        expect.any(String),
      );
      expect(createAccountComment).toHaveBeenCalledWith(
        post[0].did,
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe("trackOnly behavior", () => {
    it("should track for account threshold without emitting post label when trackOnly is true", async () => {
      const post = createMockPost({ text: "check out this shopping link" });

      await checkPosts(post);

      expect(createPostLabel).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "track-only-label",
        expect.any(String),
        expect.any(Number),
        expect.any(String),
        expect.any(Number),
      );

      expect(checkAccountThreshold).toHaveBeenCalledWith(
        post[0].did,
        post[0].atURI,
        "track-only-label",
        post[0].time,
      );
    });
  });
});
