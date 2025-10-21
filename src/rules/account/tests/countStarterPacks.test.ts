 
 
 
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAccountLabel } from "../../../accountModeration.js";
import { agent } from "../../../agent.js";
import { limit } from "../../../limits.js";
import { logger } from "../../../logger.js";
import { countStarterPacks } from "../countStarterPacks.js";

// Mock dependencies
vi.mock("../../../agent.js", () => ({
  agent: {
    app: {
      bsky: {
        actor: {
          getProfile: vi.fn(),
        },
      },
    },
  },
  isLoggedIn: Promise.resolve(true),
}));

vi.mock("../../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../accountModeration.js", () => ({
  createAccountLabel: vi.fn(),
}));

vi.mock("../../../limits.js", () => ({
  limit: vi.fn((fn) => fn()),
}));

describe("countStarterPacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should skip whitelisted DIDs", async () => {
    const whitelistedDid = "did:plc:gpunjjgvlyb4racypz3yfiq4";
    const time = Date.now() * 1000;

    await countStarterPacks(whitelistedDid, time);

    expect(logger.debug).toHaveBeenCalledWith(
      { process: "COUNTSTARTERPACKS", did: whitelistedDid, time },
      "Account is whitelisted",
    );
    expect(agent.app.bsky.actor.getProfile).not.toHaveBeenCalled();
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should label accounts with more than 20 starter packs", async () => {
    const did = "did:plc:test123";
    const time = Date.now() * 1000;
    const starterPackCount = 25;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: {
          starterPacks: starterPackCount,
        },
      },
    } as any);

    await countStarterPacks(did, time);

    expect(limit).toHaveBeenCalled();
    expect(agent.app.bsky.actor.getProfile).toHaveBeenCalledWith({
      actor: did,
    });
    expect(logger.info).toHaveBeenCalledWith(
      {
        process: "COUNTSTARTERPACKS",
        did,
        time,
        starterPackCount,
      },
      "Labeling account with excessive starter packs",
    );
    expect(createAccountLabel).toHaveBeenCalledWith(
      did,
      "follow-farming",
      `${time}: Account has ${starterPackCount} starter packs`,
    );
  });

  it("should not label accounts with exactly 20 starter packs", async () => {
    const did = "did:plc:test456";
    const time = Date.now() * 1000;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: {
          starterPacks: 20,
        },
      },
    } as any);

    await countStarterPacks(did, time);

    expect(agent.app.bsky.actor.getProfile).toHaveBeenCalledWith({
      actor: did,
    });
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should not label accounts with fewer than 20 starter packs", async () => {
    const did = "did:plc:test789";
    const time = Date.now() * 1000;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: {
          starterPacks: 15,
        },
      },
    } as any);

    await countStarterPacks(did, time);

    expect(agent.app.bsky.actor.getProfile).toHaveBeenCalledWith({
      actor: did,
    });
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should not label accounts with no associated starter packs", async () => {
    const did = "did:plc:test000";
    const time = Date.now() * 1000;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: undefined,
      },
    } as any);

    await countStarterPacks(did, time);

    expect(agent.app.bsky.actor.getProfile).toHaveBeenCalledWith({
      actor: did,
    });
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should not label accounts with no starter packs field", async () => {
    const did = "did:plc:test111";
    const time = Date.now() * 1000;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: {
          starterPacks: undefined,
        },
      },
    } as any);

    await countStarterPacks(did, time);

    expect(agent.app.bsky.actor.getProfile).toHaveBeenCalledWith({
      actor: did,
    });
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should handle errors when fetching profile", async () => {
    const did = "did:plc:testerror";
    const time = Date.now() * 1000;
    const error = new Error("Profile not found");

    vi.mocked(agent.app.bsky.actor.getProfile).mockRejectedValue(error);

    await countStarterPacks(did, time);

    expect(logger.error).toHaveBeenCalledWith(
      {
        process: "COUNTSTARTERPACKS",
        did,
        time,
        name: error.name,
        message: error.message,
      },
      "Error checking associated accounts",
    );
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should handle non-Error exceptions", async () => {
    const did = "did:plc:teststring";
    const time = Date.now() * 1000;
    const error = "String error message";

    vi.mocked(agent.app.bsky.actor.getProfile).mockRejectedValue(error);

    await countStarterPacks(did, time);

    expect(logger.error).toHaveBeenCalledWith(
      {
        process: "COUNTSTARTERPACKS",
        did,
        time,
        error: String(error),
      },
      "Error checking associated accounts",
    );
    expect(createAccountLabel).not.toHaveBeenCalled();
  });

  it("should use limit function for rate limiting", async () => {
    const did = "did:plc:testlimit";
    const time = Date.now() * 1000;

    vi.mocked(agent.app.bsky.actor.getProfile).mockResolvedValue({
      data: {
        associated: {
          starterPacks: 10,
        },
      },
    } as any);

    await countStarterPacks(did, time);

    expect(limit).toHaveBeenCalledWith(expect.any(Function));
  });
});
