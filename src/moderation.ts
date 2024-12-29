import { agent, isLoggedIn } from "./agent.js";
import { MOD_DID } from "./config.js";
import { limit } from "./limits.js";
import logger from "./logger.js";
import { LISTS } from "./lists.js";

/**
 * Creates a moderation label for a post on ATProto/Bluesky.
 *
 * This async function applies a label to a specific post using the Ozone moderation system.
 * It requires authentication and implements rate limiting.
 *
 * @param uri - The atURI of the post to be labeled
 * @param cid - The cid of the post
 * @param label - The label to be applied to the post
 * @param comment - A comment explaining why the label was applied
 *
 * @example
 * await createPostLabel(
 *   'at://did:plc:xyz/post/123',
 *   'bafyreib2rxk3rfy',
 *   'spam',
 *   'This post contains spam content'
 * );
 *
 * @throws Will log an error to console if the label creation fails
 *
 * @note This function requires:
 * - User to be logged in
 * - Proper moderation permissions
 * - Valid MOD_DID configuration
 *
 * The function uses the Ozone moderation API to emit a labeling event with:
 * - The specified label
 * - A timestamp
 * - The creator's DID
 * - Required proxy and labeler headers
 */
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

/**
 * Creates a moderation label for an ATProto/Bluesky account.
 *
 * This async function applies a label to a user account using the Ozone moderation system.
 * It requires authentication and implements rate limiting.
 *
 * @param did - The Decentralized Identifier (DID) of the account to be labeled
 * @param label - The label to be applied to the account
 * @param comment - A comment explaining why the label was applied
 *
 * @example
 * await createAccountLabel(
 *   'did:plc:abcdefghijklmno',
 *   'spam',
 *   'Account engaged in spamming behavior'
 * );
 *
 * @throws Will log an error to console if the label creation fails
 *
 * @note This function requires:
 * - User to be logged in
 * - Proper moderation permissions
 * - Valid MOD_DID configuration
 *
 * The function uses the Ozone moderation API to emit a labeling event with:
 * - The specified label for the account
 * - A timestamp
 * - The moderator's DID
 * - Required proxy and labeler headers
 *
 * Unlike post labeling, this function labels an entire account/repository
 * using the 'com.atproto.admin.defs#repoRef' type.
 */
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

/**
 * Creates a moderation comment on an ATProto/Bluesky account.
 *
 * This async function adds a moderation comment to a user account using the Ozone
 * moderation system. Unlike labels, comments are internal notes that don't affect
 * the account's status. It requires authentication and implements rate limiting.
 *
 * @param did - The Decentralized Identifier (DID) of the account to comment on
 * @param comment - The moderation comment to be added to the account
 *
 * @example
 * await createAccountComment(
 *   'did:plc:abcdefghijklmno',
 *   'User was warned about repeated violations of community guidelines'
 * );
 *
 * @throws Will log an error to console if the comment creation fails
 *
 * @note This function requires:
 * - User to be logged in
 * - Proper moderation permissions
 * - Valid MOD_DID configuration
 *
 * The function uses the Ozone moderation API to emit a comment event with:
 * - The comment text
 * - A timestamp
 * - The moderator's DID
 * - Required proxy and labeler headers
 *
 * This is useful for maintaining internal moderation notes and documentation
 * without applying actual moderation actions to the account.
 */
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

export const addToList = async (did: string, label: string) => {
  await isLoggedIn;
  const newList = LISTS.find((list) => list.rkey === rkey);
  if (!newList) {
    logger.warn(
      `List not found for ${label}. Likely a label not associated with a list`,
    );
    return;
  }
  logger.info(`New label: ${newList.rkey}`);

  const listUri = `at://${MOD_DID!}/app.bsky.graph.list/${newList.rkey}`;

  await limit(async () => {
    try {
      return agent.com.atproto.repo.createRecord({
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
