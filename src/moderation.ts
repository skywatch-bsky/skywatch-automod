import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import logger from "./logger.js";

export const createPostLabel = async (
  uri: string,
  cid: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventLabel",
            comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri,
            cid,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      logger.error(`Failed to create post label with error: ${e}`);
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
      await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventLabel",
            comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      logger.error(`Failed to create account label with error: ${e}`);
    }
  });
};

export const createPostReport = async (
  uri: string,
  cid: string,
  comment: string,
) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventReport",
            comment,
            reportType: "com.atproto.moderation.defs#reasonOther",
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri,
            cid,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );
    } catch (e) {
      logger.error(`Failed to create post label with error: ${e}`);
    }
  });
};

export const createAccountComment = async (did: string, comment: string) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventComment",
            comment,
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
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

export const createAccountReport = async (did: string, comment: string) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventReport",
            comment,
            reportType: "com.atproto.moderation.defs#reasonOther",
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
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

export async function checkAccountLabels(did: string) {
  /* try {
    const repo = await limit(() =>
      agent.tools.ozone.moderation.getRepo(
        {
          did: did,
        },
        {
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      ),
    );

    if (!repo.data.labels) {
      return null;
    }

    return repo.data.labels.map((label) => label.label);
  } catch (e) {
    logger.info("Error retrieving repo for account.");
    return null;
    } */
  return null;
}
