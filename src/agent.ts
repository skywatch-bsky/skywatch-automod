import { Agent, setGlobalDispatcher } from "undici";
import { AtpAgent } from "@atproto/api";
import { BSKY_HANDLE, BSKY_PASSWORD, OZONE_PDS } from "./config.js";
import { updateRateLimitState } from "./limits.js";
import { logger } from "./logger.js";
import { type SessionData, loadSession, saveSession } from "./session.js";

setGlobalDispatcher(
  new Agent({
    connect: { timeout: 20_000 },
    keepAliveTimeout: 10_000,
    keepAliveMaxTimeout: 20_000,
  }),
);

const customFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  // Extract rate limit headers from ATP responses
  const limitHeader = response.headers.get("ratelimit-limit");
  const remainingHeader = response.headers.get("ratelimit-remaining");
  const resetHeader = response.headers.get("ratelimit-reset");
  const policyHeader = response.headers.get("ratelimit-policy");

  if (limitHeader && remainingHeader && resetHeader) {
    updateRateLimitState({
      limit: parseInt(limitHeader, 10),
      remaining: parseInt(remainingHeader, 10),
      reset: parseInt(resetHeader, 10),
      policy: policyHeader || undefined,
    });
  }

  return response;
};

export const agent = new AtpAgent({
  service: `https://${OZONE_PDS}`,
  fetch: customFetch,
});

const JWT_LIFETIME_MS = 2 * 60 * 60 * 1000; // 2 hours (typical ATP JWT lifetime)
const REFRESH_AT_PERCENT = 0.8; // Refresh at 80% of lifetime
let refreshTimer: NodeJS.Timeout | null = null;

async function refreshSession(): Promise<void> {
  try {
    logger.info("Refreshing session tokens");
    await agent.resumeSession(agent.session!);

    if (agent.session) {
      saveSession(agent.session as SessionData);
      scheduleSessionRefresh();
    }
  } catch (error) {
    logger.error({ error }, "Failed to refresh session, will re-authenticate");
    await performLogin();
  }
}

function scheduleSessionRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const refreshIn = JWT_LIFETIME_MS * REFRESH_AT_PERCENT;
  logger.debug(
    `Scheduling session refresh in ${(refreshIn / 1000 / 60).toFixed(1)} minutes`,
  );

  refreshTimer = setTimeout(() => {
    refreshSession().catch((error) => {
      logger.error({ error }, "Scheduled session refresh failed");
    });
  }, refreshIn);
}

async function performLogin(): Promise<boolean> {
  try {
    logger.info("Performing fresh login");
    const response = await agent.login({
      identifier: BSKY_HANDLE,
      password: BSKY_PASSWORD,
    });

    if (response.success && agent.session) {
      saveSession(agent.session as SessionData);
      scheduleSessionRefresh();
      logger.info("Login successful, session saved");
      return true;
    }

    logger.error("Login failed: no session returned");
    return false;
  } catch (error) {
    logger.error({ error }, "Login failed");
    return false;
  }
}

async function authenticate(): Promise<boolean> {
  const savedSession = loadSession();

  if (savedSession) {
    try {
      logger.info("Attempting to resume saved session");
      await agent.resumeSession(savedSession);

      // Verify session is still valid with a lightweight call
      await agent.getProfile({ actor: savedSession.did });

      logger.info("Session resumed successfully");
      scheduleSessionRefresh();
      return true;
    } catch (error) {
      logger.warn({ error }, "Saved session invalid, will re-authenticate");
    }
  }

  return performLogin();
}

export const login = authenticate;
export const isLoggedIn = authenticate()
  .then((success) => success)
  .catch(() => false);
