import { pRateLimit } from "p-ratelimit";
import { Counter, Gauge, Histogram } from "prom-client";
import { logger } from "./logger.js";

interface RateLimitState {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  policy?: string;
}

// Conservative defaults based on previous static configuration
// Will be replaced with dynamic values from ATP response headers
let rateLimitState: RateLimitState = {
  limit: 280,
  remaining: 280,
  reset: Math.floor(Date.now() / 1000) + 30,
};

const SAFETY_BUFFER = 5; // Keep this many requests in reserve (reduced from 20)
const CONCURRENCY = 24; // Reduced from 48 to prevent rapid depletion

// Metrics
const rateLimitWaitsTotal = new Counter({
  name: "rate_limit_waits_total",
  help: "Total number of times rate limit wait was triggered",
});

const rateLimitWaitDuration = new Histogram({
  name: "rate_limit_wait_duration_seconds",
  help: "Duration of rate limit waits in seconds",
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
});

const rateLimitRemaining = new Gauge({
  name: "rate_limit_remaining",
  help: "Current remaining rate limit",
});

const rateLimitTotal = new Gauge({
  name: "rate_limit_total",
  help: "Total rate limit from headers",
});

const concurrentRequestsGauge = new Gauge({
  name: "concurrent_requests",
  help: "Current number of concurrent requests",
});

// Use p-ratelimit purely for concurrency management
const concurrencyLimiter = pRateLimit({
  interval: 1000,
  rate: 10000, // Very high rate, we manage rate limiting separately
  concurrency: CONCURRENCY,
  maxDelay: 0,
});

export function getRateLimitState(): RateLimitState {
  return { ...rateLimitState };
}

export function updateRateLimitState(state: Partial<RateLimitState>): void {
  rateLimitState = { ...rateLimitState, ...state };

  // Update Prometheus metrics
  if (state.remaining !== undefined) {
    rateLimitRemaining.set(state.remaining);
  }
  if (state.limit !== undefined) {
    rateLimitTotal.set(state.limit);
  }

  logger.debug(
    {
      limit: rateLimitState.limit,
      remaining: rateLimitState.remaining,
      resetIn: rateLimitState.reset - Math.floor(Date.now() / 1000),
    },
    "Rate limit state updated",
  );
}

async function awaitRateLimit(): Promise<void> {
  const state = getRateLimitState();
  const now = Math.floor(Date.now() / 1000);

  // Only wait if we're critically low
  if (state.remaining <= SAFETY_BUFFER) {
    rateLimitWaitsTotal.inc();

    const delaySeconds = Math.max(0, state.reset - now);
    const delayMs = delaySeconds * 1000;

    if (delayMs > 0) {
      logger.warn(
        `Rate limit critical (${state.remaining}/${state.limit} remaining). Waiting ${delaySeconds}s until reset...`,
      );

      const waitStart = Date.now();
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const waitDuration = (Date.now() - waitStart) / 1000;
      rateLimitWaitDuration.observe(waitDuration);

      // Don't manually reset state - let the next API response update it
      logger.info("Rate limit wait complete, resuming requests");
    }
  }
}

export async function limit<T>(fn: () => Promise<T>): Promise<T> {
  return concurrencyLimiter(async () => {
    concurrentRequestsGauge.inc();
    try {
      await awaitRateLimit();
      return await fn();
    } finally {
      concurrentRequestsGauge.dec();
    }
  });
}
