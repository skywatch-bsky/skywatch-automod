import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import { logger } from "./logger.js";
import { labelsAppliedCounter, labelsCachedCounter } from "./metrics.js";
import { tryClaimAccountComment, tryClaimAccountLabel } from "./redis.js";

const doesLabelExist = (
  labels: { val: string }[] | undefined,
  labelVal: string,
): boolean => {
  if (!labels) {
    return false;
  }
  return labels.some((label) => label.val === labelVal);
};

export const createAccountLabel = async (
  did: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;

  const claimed = await tryClaimAccountLabel(did, label);
  if (!claimed) {
    logger.debug(
      { process: "MODERATION", did, label },
      "Account label already claimed in Redis, skipping",
    );
    labelsCachedCounter.inc({
      label_type: label,
      target_type: "account",
      reason: "redis_cache",
    });
    return;
  }

  const hasLabel = await checkAccountLabels(did, label);
  if (hasLabel) {
    logger.debug(
      { process: "MODERATION", did, label },
      "Account already has label, skipping",
    );
    labelsCachedCounter.inc({
      label_type: label,
      target_type: "account",
      reason: "existing_label",
    });
    return;
  }

  logger.info({ process: "MODERATION", did, label }, "Labeling account");
  labelsAppliedCounter.inc({ label_type: label, target_type: "account" });

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
      logger.error(
        { process: "MODERATION", error: e },
        "Failed to create account label",
      );
    }
  });
};

export const createAccountComment = async (
  did: string,
  comment: string,
  atURI: string,
) => {
  await isLoggedIn;

  const claimed = await tryClaimAccountComment(did, atURI);
  if (!claimed) {
    logger.debug(
      { process: "MODERATION", did, atURI },
      "Account comment already claimed in Redis, skipping",
    );
    return;
  }

  logger.info({ process: "MODERATION", did, atURI }, "Commenting on account");

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
      logger.error(
        { process: "MODERATION", error: e },
        "Failed to create account comment",
      );
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
      logger.error(
        { process: "MODERATION", error: e },
        "Failed to create account report",
      );
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
      logger.error(
        { process: "MODERATION", did, error: e },
        "Failed to check account labels",
      );
      return false;
    }
  });
};
