import logger from "./logger.js";

interface EnvironmentVariable {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENV_VARIABLES: EnvironmentVariable[] = [
  {
    name: "DID",
    required: true,
    description: "Moderator DID for labeling operations",
    validator: (value) => value.startsWith("did:"),
  },
  {
    name: "OZONE_URL",
    required: true,
    description: "Ozone server URL",
    validator: (value) => value.includes(".") && value.length > 3,
  },
  {
    name: "OZONE_PDS",
    required: true,
    description: "Ozone PDS URL",
    validator: (value) => value.includes(".") && value.length > 3,
  },
  {
    name: "BSKY_HANDLE",
    required: true,
    description: "Bluesky handle for authentication",
    validator: (value) => value.includes("."),
  },
  {
    name: "BSKY_PASSWORD",
    required: true,
    description: "Bluesky password for authentication",
    validator: (value) => value.length > 0,
  },
  {
    name: "HOST",
    required: false,
    description: "Host address for the server (defaults to 127.0.0.1)",
  },
  {
    name: "PORT",
    required: false,
    description: "Port for the main server (defaults to 4100)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "METRICS_PORT",
    required: false,
    description: "Port for metrics server (defaults to 4101)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "FIREHOSE_URL",
    required: false,
    description: "Jetstream firehose WebSocket URL",
    validator: (value) => value.startsWith("ws"),
  },
  {
    name: "CURSOR_UPDATE_INTERVAL",
    required: false,
    description: "Cursor update interval in milliseconds (defaults to 60000)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "LABEL_LIMIT",
    required: false,
    description: "Rate limit for labeling operations",
    validator: (value) => {
      // Allow "number * number" format or plain numbers
      const multiplyMatch = /^(\d+)\s*\*\s*(\d+)$/.exec(value);
      if (multiplyMatch) {
        const result = Number(multiplyMatch[1]) * Number(multiplyMatch[2]);
        return result > 0;
      }
      return !isNaN(Number(value)) && Number(value) > 0;
    },
  },
  {
    name: "LABEL_LIMIT_WAIT",
    required: false,
    description: "Wait time between rate limited operations",
    validator: (value) => {
      // Allow "number * number" format or plain numbers
      const multiplyMatch = /^(\d+)\s*\*\s*(\d+)$/.exec(value);
      if (multiplyMatch) {
        const result = Number(multiplyMatch[1]) * Number(multiplyMatch[2]);
        return result > 0;
      }
      return !isNaN(Number(value)) && Number(value) > 0;
    },
  },
  {
    name: "LOG_LEVEL",
    required: false,
    description: "Logging level (trace, debug, info, warn, error, fatal)",
    validator: (value) =>
      ["trace", "debug", "info", "warn", "error", "fatal"].includes(value),
  },
  {
    name: "NODE_ENV",
    required: false,
    description: "Node environment (development, production, test)",
    validator: (value) => ["development", "production", "test"].includes(value),
  },
  {
    name: "DATABASE_URL",
    required: false,
    description: "PostgreSQL database connection URL",
    validator: (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
  },
  {
    name: "DATABASE_POOL_SIZE",
    required: false,
    description: "Database connection pool size (defaults to 10)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "OZONE_LABEL_STREAM_URL",
    required: false,
    description: "Ozone label subscription WebSocket URL",
    validator: (value) => value.startsWith("ws"),
  },
  {
    name: "OZONE_RECONNECT_MAX_ATTEMPTS",
    required: false,
    description:
      "Maximum reconnection attempts for Ozone stream (defaults to 5)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "OZONE_RECONNECT_DELAY_MS",
    required: false,
    description: "Delay between reconnection attempts in ms (defaults to 1000)",
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
  },
  {
    name: "ENABLE_LABEL_DEDUP",
    required: false,
    description: "Enable label deduplication feature (defaults to false)",
    validator: (value) =>
      ["true", "false", "1", "0"].includes(value.toLowerCase()),
  },
  {
    name: "ENABLE_LABEL_SYNC",
    required: false,
    description: "Enable label sync from Ozone stream (defaults to false)",
    validator: (value) =>
      ["true", "false", "1", "0"].includes(value.toLowerCase()),
  },
];

export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  logger.info("Validating environment variables...");

  for (const envVar of ENV_VARIABLES) {
    const value = process.env[envVar.name];

    if (envVar.required) {
      if (!value || value.trim() === "") {
        errors.push(
          `Required environment variable ${envVar.name} is missing. ${envVar.description}`,
        );
        continue;
      }
    }

    if (value && envVar.validator) {
      try {
        if (!envVar.validator(value)) {
          errors.push(
            `Environment variable ${envVar.name} has invalid format. ${envVar.description}`,
          );
        }
      } catch (error) {
        errors.push(
          `Environment variable ${envVar.name} validation failed: ${String(error)}. ${envVar.description}`,
        );
      }
    }

    if (!envVar.required && !value) {
      warnings.push(
        `Optional environment variable ${envVar.name} not set, using default. ${envVar.description}`,
      );
    }
  }

  if (warnings.length > 0) {
    logger.warn("Environment variable warnings:");
    warnings.forEach((warning) => {
      logger.warn(`  - ${warning}`);
    });
  }

  if (errors.length > 0) {
    logger.error("Environment variable validation failed:");
    errors.forEach((error) => {
      logger.error(`  - ${error}`);
    });
    logger.error("Please check your environment configuration and try again.");
    process.exit(1);
  }

  logger.info("Environment variable validation completed successfully");
}
