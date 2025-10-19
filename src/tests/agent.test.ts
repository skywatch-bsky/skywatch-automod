import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";

const mockSessionData = { did: "did:plc:test", handle: "test.bsky.social" };

// Mock dependencies that need to be hoisted
vi.mock("../config.js", () => ({
  BSKY_HANDLE: "test.bsky.social",
  BSKY_PASSWORD: "password",
  OZONE_PDS: "pds.ozone.dev",
}));

vi.mock("node:fs", () => ({
  default: {
    promises: {
      writeFile: vi.fn(),
      readFile: vi.fn(),
    },
    existsSync: vi.fn(),
  },
}));

const mockLogin = vi.fn();
const mockResumeSession = vi.fn();
vi.mock("@atproto/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AtpAgent: vi.fn(() => ({
      login: mockLogin,
      resumeSession: mockResumeSession,
      session: undefined,
    })),
  };
});

describe("agent", () => {
  let mockedFs;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();

    // Since we mock 'node:fs', we need to get the mocked version for our assertions
    mockedFs = (await import("node:fs")).default;
  });

  describe("authenticate", () => {
    it("should resume session if session file exists", async () => {
      // Set up mocks BEFORE importing the module
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.promises.readFile.mockResolvedValue(JSON.stringify(mockSessionData));
      mockResumeSession.mockResolvedValue(undefined);

      const agentModule = await import("../agent.js");
      await agentModule.isLoggedIn;

      expect(mockedFs.existsSync).toHaveBeenCalledWith(expect.stringContaining("session.json"));
      expect(mockedFs.promises.readFile).toHaveBeenCalledWith(expect.stringContaining("session.json"), "utf-8");
      expect(agentModule.agent.resumeSession).toHaveBeenCalledWith(mockSessionData);
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should login fresh if session file does not exist", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      let agentRef;
      mockLogin.mockImplementation(function() {
        agentRef = this;
        this.session = mockSessionData;
        return Promise.resolve();
      });

      const agentModule = await import("../agent.js");
      await agentModule.isLoggedIn;

      expect(mockedFs.existsSync).toHaveBeenCalledWith(expect.stringContaining("session.json"));
      expect(mockedFs.promises.readFile).not.toHaveBeenCalled();
      expect(agentModule.agent.resumeSession).not.toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: "test.bsky.social",
        password: "password",
      });
      expect(mockedFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("session.json"),
        JSON.stringify(mockSessionData, null, 2)
      );
    });

    it("should login fresh if resuming session fails", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.promises.readFile.mockResolvedValue(JSON.stringify(mockSessionData));
      mockResumeSession.mockRejectedValue(new Error("Invalid session"));
      mockLogin.mockImplementation(function() {
        this.session = mockSessionData;
        return Promise.resolve();
      });

      const agentModule = await import("../agent.js");
      await agentModule.isLoggedIn;

      expect(mockLogin).toHaveBeenCalled();
      expect(mockedFs.promises.writeFile).toHaveBeenCalled();
    });
  });

  describe("saveSession", () => {
    it("should write session to file if session exists after login", async () => {
      mockedFs.existsSync.mockReturnValue(false); // Force login path
      mockLogin.mockImplementation(function() {
        this.session = mockSessionData;
        return Promise.resolve();
      });

      const agentModule = await import("../agent.js");
      await agentModule.isLoggedIn;

      expect(mockedFs.promises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("session.json"),
        JSON.stringify(mockSessionData, null, 2)
      );
    });

    it("should not write to file if session does not exist after login attempt", async () => {
      mockedFs.existsSync.mockReturnValue(false); // Force login path
      mockLogin.mockImplementation(function() {
        this.session = undefined; // Simulate login failure
        return Promise.resolve();
      });

      const agentModule = await import("../agent.js");
      await agentModule.isLoggedIn;

      expect(mockedFs.promises.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("loadSession", () => {
    it("should resume session when file exists", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.promises.readFile.mockResolvedValue(JSON.stringify(mockSessionData));

      // We need to re-run the module logic
      vi.resetModules();
      const newAgentModule = await import("../agent.js");
      await newAgentModule.isLoggedIn;

      expect(newAgentModule.agent.resumeSession).toHaveBeenCalledWith(mockSessionData);
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should not resume session when file does not exist", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockLogin.mockResolvedValue(undefined);

      vi.resetModules();
      const newAgentModule = await import("../agent.js");
      await newAgentModule.isLoggedIn;

      expect(newAgentModule.agent.resumeSession).not.toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });

    it("should login fresh and log error if readFile fails", async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.promises.readFile.mockRejectedValue(new Error("Read error"));
      mockLogin.mockResolvedValue(undefined);

      vi.resetModules();
      const newAgentModule = await import("../agent.js");
      await newAgentModule.isLoggedIn;

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to resume session, will login fresh:", expect.any(Error));
      expect(mockLogin).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
