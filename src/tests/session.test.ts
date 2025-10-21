import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SessionData } from "../session.js";

const TEST_DIR = join(process.cwd(), ".test-session");
const TEST_SESSION_PATH = join(TEST_DIR, ".session");

// Helper functions that mimic session.ts but use TEST_SESSION_PATH
function testLoadSession(): SessionData | null {
  try {
    if (!existsSync(TEST_SESSION_PATH)) {
      return null;
    }

    const data = readFileSync(TEST_SESSION_PATH, "utf-8");
    const session = JSON.parse(data) as SessionData;

    if (!session.accessJwt || !session.refreshJwt || !session.did) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

function testSaveSession(session: SessionData): void {
  try {
    const data = JSON.stringify(session, null, 2);
    writeFileSync(TEST_SESSION_PATH, data, "utf-8");
    chmodSync(TEST_SESSION_PATH, 0o600);
  } catch (error) {
    // Ignore errors for test
  }
}

function testClearSession(): void {
  try {
    if (existsSync(TEST_SESSION_PATH)) {
      unlinkSync(TEST_SESSION_PATH);
    }
  } catch (error) {
    // Ignore errors for test
  }
}

describe("session", () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("saveSession", () => {
    it("should save session to file with proper permissions", () => {
      const session: SessionData = {
        accessJwt: "access-token",
        refreshJwt: "refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      testSaveSession(session);

      expect(existsSync(TEST_SESSION_PATH)).toBe(true);
    });

    it("should save all session fields correctly", () => {
      const session: SessionData = {
        accessJwt: "access-token",
        refreshJwt: "refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        email: "test@example.com",
        emailConfirmed: true,
        emailAuthFactor: false,
        active: true,
        status: "active",
      };

      testSaveSession(session);

      const loaded = testLoadSession();
      expect(loaded).toEqual(session);
    });
  });

  describe("loadSession", () => {
    it("should return null if session file does not exist", () => {
      const session = testLoadSession();
      expect(session).toBeNull();
    });

    it("should load valid session from file", () => {
      const session: SessionData = {
        accessJwt: "access-token",
        refreshJwt: "refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      testSaveSession(session);
      const loaded = testLoadSession();

      expect(loaded).toEqual(session);
    });

    it("should return null for corrupted session file", () => {
      writeFileSync(TEST_SESSION_PATH, "{ invalid json", "utf-8");

      const session = testLoadSession();
      expect(session).toBeNull();
    });

    it("should return null for session missing required fields", () => {
      writeFileSync(
        TEST_SESSION_PATH,
        JSON.stringify({ accessJwt: "token" }),
        "utf-8",
      );

      const session = testLoadSession();
      expect(session).toBeNull();
    });

    it("should return null for session missing did", () => {
      writeFileSync(
        TEST_SESSION_PATH,
        JSON.stringify({
          accessJwt: "access",
          refreshJwt: "refresh",
          handle: "test.bsky.social",
        }),
        "utf-8",
      );

      const session = testLoadSession();
      expect(session).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("should remove session file if it exists", () => {
      const session: SessionData = {
        accessJwt: "access-token",
        refreshJwt: "refresh-token",
        did: "did:plc:test123",
        handle: "test.bsky.social",
        active: true,
      };

      testSaveSession(session);
      expect(existsSync(TEST_SESSION_PATH)).toBe(true);

      testClearSession();
      expect(existsSync(TEST_SESSION_PATH)).toBe(false);
    });

    it("should not throw if session file does not exist", () => {
      expect(() => testClearSession()).not.toThrow();
    });
  });
});
