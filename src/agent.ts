import { setGlobalDispatcher, Agent as Agent } from "undici";
setGlobalDispatcher(new Agent({ connect: { timeout: 20_000 } }));
import { BSKY_HANDLE, BSKY_PASSWORD, OZONE_PDS } from "./config.js";
import { AtpAgent } from "@atproto/api";
import fs from "node:fs";
import path from "node:path";

const SESSION_FILE = path.join(process.cwd(), "session.json");

export const agent = new AtpAgent({
  service: `https://${OZONE_PDS}`,
});

async function saveSession() {
  if (agent.session) {
    await fs.promises.writeFile(
      SESSION_FILE,
      JSON.stringify(agent.session, null, 2),
    );
  }
}

async function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const sessionData = await fs.promises.readFile(SESSION_FILE, "utf-8");
      const session = JSON.parse(sessionData);
      await agent.resumeSession(session);
      return true;
    }
  } catch (error) {
    console.error("Failed to resume session, will login fresh:", error);
  }
  return false;
}

async function authenticate() {
  const resumed = await loadSession();
  if (resumed) {
    console.log("✓ Resumed existing session");
    return;
  }

  await agent.login({
    identifier: BSKY_HANDLE,
    password: BSKY_PASSWORD,
  });
  await saveSession();
  console.log("✓ Logged in and saved session");
}

export const isLoggedIn = authenticate();
