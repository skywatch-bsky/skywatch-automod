import { agent, isLoggedIn } from "./agent.js";
import { modDID } from "./config.js";
import { limit } from "./limits.js";

export const createPostLabel = async (
  uri: string,
  cid: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      return agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventLabel",
            comment: comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri: uri,
            cid: cid,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${modDID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  });
};

export const createAccountLabel = async (
  did: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      return agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventLabel",
            comment: comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did: did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${modDID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  });
};

export const createAccountComment = async (did: string, comment: string) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      return agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventComment",
            comment: comment,
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did: did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${modDID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  });
};
