import { readFileSync, writeFileSync, unlinkSync, chmodSync, existsSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./logger.js";

const SESSION_FILE_PATH = join(process.cwd(), ".session");

export interface SessionData {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
  email?: string;
  emailConfirmed?: boolean;
  emailAuthFactor?: boolean;
  active: boolean;
  status?: string;
}

export function loadSession(): SessionData | null {
  try {
    if (!existsSync(SESSION_FILE_PATH)) {
      logger.debug("No session file found");
      return null;
    }

    const data = readFileSync(SESSION_FILE_PATH, "utf-8");
    const session = JSON.parse(data) as SessionData;

    if (!session.accessJwt || !session.refreshJwt || !session.did) {
      logger.warn("Session file is missing required fields, ignoring");
      return null;
    }

    logger.info("Loaded existing session from file");
    return session;
  } catch (error) {
    logger.error({ error }, "Failed to load session file, will authenticate fresh");
    return null;
  }
}

export function saveSession(session: SessionData): void {
  try {
    const data = JSON.stringify(session, null, 2);
    writeFileSync(SESSION_FILE_PATH, data, "utf-8");
    chmodSync(SESSION_FILE_PATH, 0o600);
    logger.info("Session saved to file");
  } catch (error) {
    logger.error({ error }, "Failed to save session to file");
  }
}

export function clearSession(): void {
  try {
    if (existsSync(SESSION_FILE_PATH)) {
      unlinkSync(SESSION_FILE_PATH);
      logger.info("Session file cleared");
    }
  } catch (error) {
    logger.error({ error }, "Failed to clear session file");
  }
}
