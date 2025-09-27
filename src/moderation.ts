import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import logger from "./logger.js";
import { LabelManager } from "./services/labelManager.js";

// Initialize label manager as a singleton
let labelManager: LabelManager | null = null;

export const initializeLabelManager = async () => {
  if (!labelManager) {
    labelManager = new LabelManager();
    await labelManager.initialize();
  }
  return labelManager;
};

export const getLabelManager = () => {
  if (!labelManager) {
    throw new Error(
      "Label manager not initialized. Call initializeLabelManager() first.",
    );
  }
  return labelManager;
};

export const createPostLabel = async (
  uri: string,
  cid: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;

  // Extract DID from URI for deduplication check
  const didMatch = uri.match(/did:[^/]+/);
  const did = didMatch ? didMatch[0] : null;

  // Check if we should create this label
  if (labelManager && did) {
    const shouldCreate = await labelManager.shouldCreateLabel(did, uri, label);
    if (!shouldCreate) {
      logger.debug(`Skipping duplicate post label: ${label} for ${uri}`);
      return;
    }
  }

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

      // Store label in database after successful creation
      if (labelManager && did) {
        await labelManager.createLabel(did, uri, label, "automod");
      }
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

  // Check if we should create this label
  if (labelManager) {
    const shouldCreate = await labelManager.shouldCreateLabel(
      did,
      undefined,
      label,
    );
    if (!shouldCreate) {
      logger.debug(`Skipping duplicate account label: ${label} for ${did}`);
      return;
    }
  }

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

      // Store label in database after successful creation
      if (labelManager) {
        // For account labels, we use the DID as both the DID and URI
        await labelManager.createLabel(did, `at://${did}`, label, "automod");
      }
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
  // First check our local database if available
  if (labelManager) {
    try {
      const labels = await labelManager.getLabelsForDid(did);
      if (labels.length > 0) {
        return labels.map((l) => l.label_value);
      }
    } catch (error) {
      logger.debug("Failed to get labels from database, falling back to API");
    }
  }

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
