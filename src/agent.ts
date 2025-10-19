import { Agent, setGlobalDispatcher } from "undici";
import { AtpAgent } from "@atproto/api";
import { BSKY_HANDLE, BSKY_PASSWORD, OZONE_PDS } from "./config.js";

setGlobalDispatcher(new Agent({ connect: { timeout: 20_000 } }));

export const agent = new AtpAgent({
  service: `https://${OZONE_PDS}`,
});
export const login = () =>
  agent.login({
    identifier: BSKY_HANDLE,
    password: BSKY_PASSWORD,
  });

export const isLoggedIn = login()
  .then(() => true)
  .catch(() => false);
