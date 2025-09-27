import "dotenv/config";
import {
  createAccountLabel,
  createPostLabel,
  initializeLabelManager,
  checkAccountLabels,
} from "./src/moderation.js";
import logger from "./src/logger.js";

async function testIntegration() {
  logger.info("Starting integration test");

  try {
    // Initialize the label manager
    await initializeLabelManager();
    logger.info("Label manager initialized");

    // Test DID and URIs
    const testDid = "did:plc:integrationtest123";
    const testPostUri =
      "at://did:plc:integrationtest123/app.bsky.feed.post/test123";
    const testCid = "bafyreib2rxk3rh6kzwq";

    logger.info("Testing account label deduplication...");

    // First account label - should be created
    await createAccountLabel(
      testDid,
      "test-account-label",
      "Integration test account label",
    );
    logger.info("First account label created");

    // Second identical account label - should be skipped
    await createAccountLabel(
      testDid,
      "test-account-label",
      "Duplicate account label",
    );
    logger.info("Second account label (should be skipped)");

    logger.info("Testing post label deduplication...");

    // First post label - should be created
    await createPostLabel(
      testPostUri,
      testCid,
      "test-post-label",
      "Integration test post label",
    );
    logger.info("First post label created");

    // Second identical post label - should be skipped
    await createPostLabel(
      testPostUri,
      testCid,
      "test-post-label",
      "Duplicate post label",
    );
    logger.info("Second post label (should be skipped)");

    // Check stored labels
    const labels = await checkAccountLabels(testDid);
    logger.info("Retrieved labels from database:", labels);

    logger.info("Integration test completed successfully");
  } catch (error) {
    logger.error("Integration test failed:", error);
  }

  process.exit(0);
}

void testIntegration();
