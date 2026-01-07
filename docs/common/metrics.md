# `metrics.ts`

This module is responsible for setting up and exposing Prometheus metrics, which are essential for monitoring the health and behavior of the application. It uses the `prom-client` library to define counters and an `express` server to serve the metrics endpoint.

## Registry and Default Metrics

-   A central `Registry` is created to hold all the application's metrics.
-   `collectDefaultMetrics({ register })` is called to automatically add a set of standard metrics about the Node.js process, such as CPU usage, memory usage, and event loop lag.

## Custom Metrics (Counters)

Several custom `Counter` metrics are defined to track specific application events. Counters are a cumulative metric that represents a single monotonically increasing counter whose value can only increase.

-   **`labelsAppliedCounter`**:
    -   **Name**: `skywatch_labels_applied_total`
    -   **Purpose**: Counts the total number of moderation labels successfully applied.
    -   **Labels**:
        -   `label_type`: The value of the label being applied (e.g., "spam", "impersonation").
        -   `target_type`: The type of entity being labeled ("account" or "post").

-   **`labelsCachedCounter`**:
    -   **Name**: `skywatch_labels_cached_total`
    -   **Purpose**: Counts the number of times a label action was skipped because it was already in the Redis cache or already existed on the target.
    -   **Labels**:
        -   `label_type`: The value of the label.
        -   `target_type`: "account" or "post".
        -   `reason`: Why it was skipped ("redis_cache" or "existing_label").

-   **`unlabelsRemovedCounter`**:
    -   **Name**: `skywatch_labels_removed_total`
    -   **Purpose**: Counts labels that are removed from an account because the content no longer matches the rule criteria.
    -   **Labels**:
        -   `label_type`: The value of the label being removed.
        -   `target_type`: "account" or "post".

-   **`accountLabelsThresholdAppliedCounter`**:
    -   **Name**: `skywatch_account_labels_threshold_applied_total`
    -   **Purpose**: Counts the specific actions (label, report, comment) taken when an account meets a post-labeling threshold.
    -   **Labels**:
        -   `account_label`: The label being applied to the account.
        -   `action`: The type of action taken ("label", "report", or "comment").

-   **`accountThresholdChecksCounter`**:
    -   **Name**: `skywatch_account_threshold_checks_total`
    -   **Purpose**: Counts every time a threshold check is performed after a post is labeled.
    -   **Labels**:
        -   `post_label`: The label on the post that triggered the check.

-   **`accountThresholdMetCounter`**:
    -   **Name**: `skywatch_account_threshold_met_total`
    -   **Purpose**: Counts every time an account's post label count meets or exceeds a configured threshold.
    -   **Labels**:
        -   `account_label`: The account label that would be applied as a result.

-   **`starterPackThresholdChecksCounter`**:
    -   **Name**: `skywatch_starter_pack_threshold_checks_total`
    -   **Purpose**: Counts every time a starter pack threshold check is performed when a starter pack is created.
    -   **Labels**: None

-   **`starterPackThresholdMetCounter`**:
    -   **Name**: `skywatch_starter_pack_threshold_met_total`
    -   **Purpose**: Counts every time an account's starter pack creation count meets or exceeds a configured threshold.
    -   **Labels**:
        -   `account_label`: The account label that would be applied as a result.

-   **`starterPackLabelsThresholdAppliedCounter`**:
    -   **Name**: `skywatch_starter_pack_labels_threshold_applied_total`
    -   **Purpose**: Counts the specific actions (label, report, comment) taken when an account meets a starter pack threshold.
    -   **Labels**:
        -   `account_label`: The label being applied to the account.
        -   `action`: The type of action taken ("label", "report", or "comment").

## Metrics Server

-   An `express` application is created to serve the metrics.
-   **`app.get("/metrics", ...)`**: It defines a single endpoint, `/metrics`. When this endpoint is requested, it retrieves all the registered metrics in the Prometheus text-based format and sends them in the response.
-   **`startMetricsServer(port: number)`**: This exported function starts the express server, making it listen on the configured `HOST` and `port`. It is called once at application startup in `main.ts`.

## Dependencies

-   **`express`**: For creating the HTTP server.
-   **`prom-client`**: The core library for defining and managing Prometheus metrics.
-   **`./config.js`**: Provides the `HOST` for the server to bind to.
-   **`./logger.js`**: For logging server startup and errors.
