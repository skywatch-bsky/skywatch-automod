import { agent, isLoggedIn } from './agent.js';
import { MOD_DID } from './config.js';
import { limit } from './limits.js';
import { LISTS } from './lists.js';
import logger from './logger.js';

export const createPostLabel = async (
  uri: string,
  cid: string,
  label: string,
  comment: string,
) => {
  await isLoggedIn;
  await limit(async () => {
    try {
      return await agent.tools.ozone.moderation.emitEvent(
        {
          event: {
            $type: 'tools.ozone.moderation.defs#modEventLabel',
            comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: 'com.atproto.repo.strongRef',
            uri,
            cid,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? '',
          createdAt: new Date().toISOString(),
        },
        {
          encoding: 'application/json',
          headers: {
            'atproto-proxy': `${MOD_DID}#atproto_labeler`,
            'atproto-accept-labelers':
              'did:plc:ar7c4by46qjdydhdevvrndac;redact',
          },
        },
      );
    } catch (error) {
      logger.error(`Error creating post label for URI ${uri}:`, error);
      throw error;
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
            $type: 'tools.ozone.moderation.defs#modEventLabel',
            comment,
            createLabelVals: [label],
            negateLabelVals: [],
          },
          // specify the labeled post by strongRef
          subject: {
            $type: 'com.atproto.admin.defs#repoRef',
            did,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? '',
          createdAt: new Date().toISOString(),
        },
        {
          encoding: 'application/json',
          headers: {
            'atproto-proxy': `${MOD_DID}#atproto_labeler`,
            'atproto-accept-labelers':
              'did:plc:ar7c4by46qjdydhdevvrndac;redact',
          },
        },
      );
    } catch (error) {
      logger.error(`Error creating account label for DID ${did}:`, error);
      throw error;
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
            $type: 'tools.ozone.moderation.defs#modEventReport',
            comment,
            reportType: 'com.atproto.moderation.defs#reasonOther',
          },
          // specify the labeled post by strongRef
          subject: {
            $type: 'com.atproto.repo.strongRef',
            uri,
            cid,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? '',
          createdAt: new Date().toISOString(),
        },
        {
          encoding: 'application/json',
          headers: {
            'atproto-proxy': `${MOD_DID}#atproto_labeler`,
            'atproto-accept-labelers':
              'did:plc:ar7c4by46qjdydhdevvrndac;redact',
          },
        },
      );
    } catch (error) {
      logger.error(`Error creating post report for URI ${uri}:`, error);
      throw error;
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
            $type: 'tools.ozone.moderation.defs#modEventComment',
            comment,
          },
          // specify the labeled post by strongRef
          subject: {
            $type: 'com.atproto.admin.defs#repoRef',
            did,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? '',
          createdAt: new Date().toISOString(),
        },
        {
          encoding: 'application/json',
          headers: {
            'atproto-proxy': `${MOD_DID}#atproto_labeler`,
            'atproto-accept-labelers':
              'did:plc:ar7c4by46qjdydhdevvrndac;redact',
          },
        },
      );
    } catch (error) {
      logger.error(`Error creating account comment for DID ${did}:`, error);
      throw error;
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
            $type: 'tools.ozone.moderation.defs#modEventReport',
            comment,
            reportType: 'com.atproto.moderation.defs#reasonOther',
          },
          // specify the labeled post by strongRef
          subject: {
            $type: 'com.atproto.admin.defs#repoRef',
            did,
          },
          // put in the rest of the metadata
          createdBy: agent.did ?? '',
          createdAt: new Date().toISOString(),
        },
        {
          encoding: 'application/json',
          headers: {
            'atproto-proxy': `${MOD_DID}#atproto_labeler`,
            'atproto-accept-labelers':
              'did:plc:ar7c4by46qjdydhdevvrndac;redact',
          },
        },
      );
    } catch (error) {
      logger.error(`Error creating account report for DID ${did}:`, error);
      throw error;
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

  const listUri = `at://${MOD_DID}/app.bsky.graph.list/${newList.rkey}`;

  await limit(async () => {
    try {
      await agent.com.atproto.repo.createRecord({
        collection: 'app.bsky.graph.listitem',
        repo: MOD_DID,
        record: {
          subject: did,
          list: listUri,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error(`Error adding DID ${did} to list ${label}:`, error);
      throw error;
    }
  });
};

export function checkAccountLabels(_did: string) {
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
