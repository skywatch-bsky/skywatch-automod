import type { Server } from "http";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { startMetricsServer } from "../metrics.js";

describe("Metrics Server", () => {
  let server: Server | undefined;

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  it("should return metrics on /metrics endpoint", async () => {
    server = startMetricsServer(0);
    const response = await request(server).get("/metrics");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.text).toContain("process_cpu_user_seconds_total");
  });
});
