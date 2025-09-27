import "dotenv/config";
import { LabelManager } from "./src/services/labelManager.js";
import logger from "./src/logger.js";

async function testLabelSync() {
  logger.info("Starting label sync test");

  const manager = new LabelManager();

  try {
    await manager.initialize();
    logger.info("Label manager initialized");

    const status = manager.getSyncStatus();
    logger.info("Sync status:", status);

    logger.info("Testing deduplication...");

    const testDid = "did:plc:testuser123";
    const testUri = "at://did:plc:testuser123/app.bsky.actor.profile/self";
    const testLabel = "test-label";

    const shouldCreate = await manager.shouldCreateLabel(
      testDid,
      testUri,
      testLabel,
    );
    logger.info(`Should create label (first time): ${shouldCreate}`);

    if (shouldCreate) {
      const created = await manager.createLabel(testDid, testUri, testLabel);
      logger.info("Created label:", created);
    }

    const shouldCreateAgain = await manager.shouldCreateLabel(
      testDid,
      testUri,
      testLabel,
    );
    logger.info(`Should create label (second time): ${shouldCreateAgain}`);

    const labels = await manager.getLabelsForDid(testDid);
    logger.info(`Labels for ${testDid}:`, labels);

    if (status.syncEnabled) {
      logger.info("Waiting 10 seconds to observe sync behavior...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const finalStatus = manager.getSyncStatus();
      logger.info("Final sync status:", finalStatus);
    }
  } catch (error) {
    logger.error("Test failed:", error);
  } finally {
    await manager.shutdown();
    logger.info("Test complete");
    process.exit(0);
  }
}

void testLabelSync();
