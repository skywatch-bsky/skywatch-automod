import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import logger from "./logger.js";
import { LISTS } from "./lists.js";

const doesLabelExist = (
  labels: { val: string }[] | undefined,
  labelVal: string,
): boolean => {
  if (!labels) {
    return false;
  }
  return labels.some((label) => label.val === labelVal);
};

export const createPostLabel = async (
  uri: string,
  cid: string,
  label: string,
  comment: string,
  duration: number | undefined,
) => {
  await isLoggedIn;

  const hasLabel = await checkRecordLabels(uri, label);
  if (hasLabel) {
    logger.info(
      `Post ${uri} already has label ${label}, skipping`,
    );
    return;
  }

  await limit(async () => {
    try {
      const event: {
        $type: string;
        comment: string;
        createLabelVals: string[];
        negateLabelVals: string[];
        durationInHours?: number;
      } = {
        $type: "tools.ozone.moderation.defs#modEventLabel",
        comment: comment,
        createLabelVals: [label],
        negateLabelVals: [],
      };

      if (duration) {
        event.durationInHours = duration;
      }

      return agent.tools.ozone.moderation.emitEvent(
        {
          event: event,
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri: uri,
            cid: cid,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
          modTool: {
            name: "skywatch/skywatch-automod",
          },
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
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

  const hasLabel = await checkAccountLabels(did, label);
  if (hasLabel) {
    logger.info(
      `Account ${did} already has label ${label}, skipping`,
    );
    return;
  }

  await limit(async () => {
    try {
      await agent.tools.ozone.moderation.emitEvent(
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
          modTool: {
            name: "skywatch/skywatch-automod",
          },
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
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
      return agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: "tools.ozone.moderation.defs#modEventReport",
            comment: comment,
            reportType: "com.atproto.moderation.defs#reasonOther",
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
          modTool: {
            name: "skywatch/skywatch-automod",
          },
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
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
          modTool: {
            name: "skywatch/skywatch-automod",
          },
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
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
            comment: comment,
            reportType: "com.atproto.moderation.defs#reasonOther",
          },
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.admin.defs#repoRef",
            did: did,
          },
          // put in the rest of the metadata
          createdBy: `${agent.did}`,
          createdAt: new Date().toISOString(),
          modTool: {
            name: "skywatch/skywatch-automod",
          },
        },
        {
          encoding: "application/json",
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
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

export const checkAccountLabels = async (
  did: string,
  label: string,
): Promise<boolean> => {
  await isLoggedIn;
  return await limit(async () => {
    try {
      const response = await agent.tools.ozone.moderation.getRepo(
        { did },
        {
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );

      return doesLabelExist(response.data.labels, label);
    } catch (e) {
      logger.error(`Failed to check account labels for ${did} with error: ${e}`);
      return false;
    }
  });
};

export const checkRecordLabels = async (
  uri: string,
  label: string,
): Promise<boolean> => {
  await isLoggedIn;
  return await limit(async () => {
    try {
      const response = await agent.tools.ozone.moderation.getRecord(
        { uri },
        {
          headers: {
            "atproto-proxy": `${MOD_DID!}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );

      return doesLabelExist(response.data.labels, label);
    } catch (e) {
      logger.error(`Failed to check record labels for ${uri} with error: ${e}`);
      return false;
    }
  });
};

export const addToList = async (label: string, did: string) => {
  await isLoggedIn;

  const newList = LISTS.find((list) => list.label === label);
  if (!newList) {
    logger.warn(
      `List not found for ${label}. Likely a label not associated with a list`,
    );
    return;
  }
  logger.info(`New label added to list: ${newList.label}`);

  const listUri = `at://${MOD_DID!}/app.bsky.graph.list/${newList.rkey}`;

  await limit(async () => {
    try {
      await agent.com.atproto.repo.createRecord({
        collection: "app.bsky.graph.listitem",
        repo: `${MOD_DID!}`,
        record: {
          subject: did,
          list: listUri,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.error(e);
    }
  });
};
