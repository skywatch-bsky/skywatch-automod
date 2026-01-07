import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import { logger } from "./logger.js";
import { labelsAppliedCounter, labelsCachedCounter } from "./metrics.js";
import { tryClaimPostLabel } from "./redis.js";

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
  did?: string,
  time?: number,
) => {
  await isLoggedIn;

  const claimed = await tryClaimPostLabel(uri, label);
  if (!claimed) {
    logger.debug(
      { process: "MODERATION", uri, label },
      "Post label already claimed in Redis, skipping",
    );
    labelsCachedCounter.inc({
      label_type: label,
      target_type: "post",
      reason: "redis_cache",
    });
    return;
  }

  const hasLabel = await checkRecordLabels(uri, label);
  if (hasLabel) {
    logger.debug(
      { process: "MODERATION", uri, label },
      "Post already has label, skipping",
    );
    labelsCachedCounter.inc({
      label_type: label,
      target_type: "post",
      reason: "existing_label",
    });
    return;
  }

  logger.info(
    { process: "MODERATION", label, did, atURI: uri },
    "Labeling post",
  );
  labelsAppliedCounter.inc({ label_type: label, target_type: "post" });

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
        comment,
        createLabelVals: [label],
        negateLabelVals: [],
      };

      if (duration) {
        event.durationInHours = duration;
      }

      await agent.tools.ozone.moderation.emitEvent(
        {
          event,
          // specify the labeled post by strongRef
          subject: {
            $type: "com.atproto.repo.strongRef",
            uri,
            cid,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? "",
          createdAt: new Date().toISOString(),
          modTool: {
            name: "skywatch/skywatch-automod",
            meta: {
              time: new Date().toISOString(),
              externalUrl: `https://pdsls.dev/${uri}`,
            },
          },
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

      if (did && time) {
        try {
          // Dynamic import to avoid circular dependency:
          // accountThreshold imports from moderation (createAccountLabel, etc.)
          // moderation imports from accountThreshold (checkAccountThreshold)
          const { checkAccountThreshold } = await import(
            "./accountThreshold.js"
          );
          await checkAccountThreshold(did, uri, label, time);
        } catch (error) {
          logger.error(
            { process: "ACCOUNT_THRESHOLD", did, label, error },
            "Failed to check account threshold",
          );
        }
      }
    } catch (e) {
      logger.error(
        { process: "MODERATION", error: e },
        "Failed to create post label",
      );
      throw e;
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
      return await agent.tools.ozone.moderation.emitEvent(
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
          createdBy: agent.did ?? "",
          createdAt: new Date().toISOString(),
          modTool: {
            name: "skywatch/skywatch-automod",
            meta: {
              time: new Date().toISOString(),
              externalUrl: `https://pdsls.dev/${uri}`,
            },
          },
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
      logger.error(
        { process: "MODERATION", error: e },
        "Failed to create post report",
      );
      throw e;
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
            "atproto-proxy": `${MOD_DID}#atproto_labeler`,
            "atproto-accept-labelers":
              "did:plc:ar7c4by46qjdydhdevvrndac;redact",
          },
        },
      );

      return doesLabelExist(response.data.labels, label);
    } catch (e) {
      logger.error(
        { process: "MODERATION", uri, error: e },
        "Failed to check record labels",
      );
      return false;
    }
  });
};
