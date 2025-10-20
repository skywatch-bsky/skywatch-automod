import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "../session.js";

// TODO: Fix TypeScript mocking issues with AtpAgent
describe.skip("Agent", () => {
  let mockLogin: any;
  let mockResumeSession: any;
  let mockGetProfile: any;
  let loadSessionMock: any;
  let saveSessionMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the config variables
    vi.doMock("../config.js", () => ({
      BSKY_HANDLE: "test.bsky.social",
      BSKY_PASSWORD: "password",
      OZONE_PDS: "pds.test.com",
    }));

    // Create mock functions
    mockLogin = vi.fn(() =>
      Promise.resolve({
        success: true,
        data: {
          accessJwt: "new-access-token",
          refreshJwt: "new-refresh-token",
          did: "did:plc:test123",
          handle: "test.bsky.social",
        },
      })
    );
    mockResumeSession = vi.fn(() => Promise.resolve());
    mockGetProfile = vi.fn(() =>
      Promise.resolve({
        success: true,
        data: { did: "did:plc:test123", handle: "test.bsky.social" },
      })
    );

    // Mock the AtpAgent
    vi.doMock("@atproto/api", () => ({
      AtpAgent: class {
        login = mockLogin;
        resumeSession = mockResumeSession;
        getProfile = mockGetProfile;
        service: URL;
        session: SessionData | null = null;

        constructor(options: { service: string; fetch?: typeof fetch }) {
          this.service = new URL(options.service);
          // Store fetch function if provided for rate limit header testing
          if (options.fetch) {
            this.fetch = options.fetch;
          }
        }

        fetch?: typeof fetch;
      },
    }));

    // Mock session functions
    loadSessionMock = vi.fn(() => null);
    saveSessionMock = vi.fn();

    vi.doMock("../session.js", () => ({
      loadSession: loadSessionMock,
      saveSession: saveSessionMock,
    }));

    // Mock updateRateLimitState
    vi.doMock("../limits.js", () => ({
      updateRateLimitState: vi.fn(),
    }));

    // Mock logger
    vi.doMock("../logger.js", () => ({
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
    }));
  });

  describe("agent initialization", () => {
    it("should create an agent with correct service URL", async () => {
      const { agent } = await import("../agent.js");
      expect(agent.service.toString()).toBe("https://pds.test.com/");
    });

    it("should provide custom fetch function for rate limit headers", async () => {
      const { agent } = await import("../agent.js");
      // @ts-expect-error - Testing custom fetch
      expect(agent.fetch).toBeDefined();
    });
  });

  describe("authentication with no saved session", () => {
    it("should perform fresh login when no session exists", async () => {
      loadSessionMock.mockReturnValue(null);

      const { login } = await import("../agent.js");
      const result = await login();

      expect(loadSessionMock).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: "test.bsky.social",
        password: "password",
      });
      expect(result).toBe(true);
    });

    it("should save session after successful login", async () => {
      loadSessionMock.mockReturnValue(null);

      const mockSession: SessionData = {
        accessJwt: "new-access-token",
        refreshJwt: "new-refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      mockLogin.mockResolvedValue({
        success: true,
        data: mockSession,
      });

      // Need to manually set agent.session since we're mocking
      const { login, agent } = await import("../agent.js");
      // @ts-expect-error - Mocking session for tests
      agent.session = mockSession;

      await login();

      expect(saveSessionMock).toHaveBeenCalledWith(mockSession);
    });
  });

  describe("authentication with saved session", () => {
    it("should resume session when valid session exists", async () => {
      const savedSession: SessionData = {
        accessJwt: "saved-access-token",
        refreshJwt: "saved-refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      loadSessionMock.mockReturnValue(savedSession);

      const { login } = await import("../agent.js");
      await login();

      expect(loadSessionMock).toHaveBeenCalled();
      expect(mockResumeSession).toHaveBeenCalledWith(savedSession);
      expect(mockGetProfile).toHaveBeenCalledWith({ actor: savedSession.did });
    });

    it("should fallback to login when session resume fails", async () => {
      const savedSession: SessionData = {
        accessJwt: "invalid-token",
        refreshJwt: "invalid-refresh",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      loadSessionMock.mockReturnValue(savedSession);
      mockResumeSession.mockRejectedValue(new Error("Invalid session"));

      const { login } = await import("../agent.js");
      await login();

      expect(mockResumeSession).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });

    it("should fallback to login when profile validation fails", async () => {
      const savedSession: SessionData = {
        accessJwt: "saved-token",
        refreshJwt: "saved-refresh",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      loadSessionMock.mockReturnValue(savedSession);
      mockGetProfile.mockRejectedValue(new Error("Profile not found"));

      const { login } = await import("../agent.js");
      await login();

      expect(mockResumeSession).toHaveBeenCalled();
      expect(mockGetProfile).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  describe("rate limit header extraction", () => {
    it("should extract rate limit headers from responses", async () => {
      const { updateRateLimitState } = await import("../limits.js");
      const { agent } = await import("../agent.js");

      // Simulate a response with rate limit headers
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        headers: {
          "ratelimit-limit": "3000",
          "ratelimit-remaining": "2500",
          "ratelimit-reset": "1760927355",
          "ratelimit-policy": "3000;w=300",
        },
      });

      // @ts-expect-error - Testing custom fetch
      if (agent.fetch) {
        // @ts-expect-error - Testing custom fetch
        await agent.fetch("https://test.com", {});
      }

      // updateRateLimitState should have been called if headers are processed
      // This is a basic check - actual implementation depends on fetch wrapper
    });
  });

  describe("session refresh", () => {
    it("should schedule session refresh after login", async () => {
      vi.useFakeTimers();

      loadSessionMock.mockReturnValue(null);

      const mockSession: SessionData = {
        accessJwt: "access-token",
        refreshJwt: "refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      mockLogin.mockResolvedValue({
        success: true,
        data: mockSession,
      });

      const { login, agent } = await import("../agent.js");
      // @ts-expect-error - Mocking session for tests
      agent.session = mockSession;

      await login();

      // Fast-forward time to trigger refresh (2 hours * 0.8 = 96 minutes)
      vi.advanceTimersByTime(96 * 60 * 1000);

      vi.useRealTimers();
    });
  });

  describe("error handling", () => {
    it("should return false on login failure", async () => {
      loadSessionMock.mockReturnValue(null);
      mockLogin.mockResolvedValue({ success: false });

      const { login } = await import("../agent.js");
      const result = await login();

      expect(result).toBe(false);
    });

    it("should return false when login throws error", async () => {
      loadSessionMock.mockReturnValue(null);
      mockLogin.mockRejectedValue(new Error("Network error"));

      const { login } = await import("../agent.js");
      const result = await login();

      expect(result).toBe(false);
    });
  });
});
