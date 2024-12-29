import { setGlobalDispatcher, Agent as Agent } from "undici";
setGlobalDispatcher(new Agent({ connect: { timeout: 20_000 } }));
import { BSKY_HANDLE, BSKY_PASSWORD, OZONE_PDS } from "./config.js";
import { LIST_HANDLE, LIST_PASSWORD, LIST_PDS } from "./config.js";
import { AtpAgent } from "@atproto/api";

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

export const listAgent = new AtpAgent({
  service: `https://${LIST_PDS}`,
});
export const loginList = () =>
  agent.login({
    identifier: LIST_HANDLE,
    password: LIST_PASSWORD,
  });

export const isLoggedInList = loginList()
  .then(() => true)
  .catch(() => false);
