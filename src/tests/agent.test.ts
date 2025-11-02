import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Agent", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should create an agent and login", async () => {
    // Mock the config variables
    vi.doMock("../config.js", () => ({
      BSKY_HANDLE: "test.bsky.social",
      BSKY_PASSWORD: "password",
      OZONE_PDS: "pds.test.com",
    }));

    // Mock session
    const mockSession = {
      did: "did:plc:test123",
      handle: "test.bsky.social",
      accessJwt: "test-access-jwt",
      refreshJwt: "test-refresh-jwt",
    };

    // Mock the AtpAgent
    const mockLogin = vi.fn(() =>
      Promise.resolve({ success: true, data: mockSession }),
    );
    const mockConstructor = vi.fn();
    vi.doMock("@atproto/api", () => ({
      AtpAgent: class {
        login = mockLogin;
        service: URL;
        session = mockSession;
        constructor(options: { service: string }) {
          mockConstructor(options);
          this.service = new URL(options.service);
        }
      },
    }));

    const { agent, login } = await import("../agent.js");

    // Check that the agent was created with the correct service URL
    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "https://pds.test.com",
      }),
    );
    expect(agent.service.toString()).toBe("https://pds.test.com/");

    // Check that the login function calls the mockLogin function
    await login();
    expect(mockLogin).toHaveBeenCalledWith({
      identifier: "test.bsky.social",
      password: "password",
    });
  });
});
