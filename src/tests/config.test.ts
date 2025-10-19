import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateTrackedLabelConfig } from "../config.js";
import type { TrackedLabelConfig } from "../types.js";

describe("config validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateTrackedLabelConfig", () => {
    const validConfig: TrackedLabelConfig = {
      label: "spam",
      threshold: 5,
      accountLabel: "repeat-spammer",
      accountComment: "Account has posted spam multiple times",
    };

    describe("valid configurations", () => {
      it("should accept valid minimal configuration", () => {
        expect(() =>
          validateTrackedLabelConfig(validConfig, 0),
        ).not.toThrow();
      });

      it("should accept configuration with optional windowDays", () => {
        const configWithWindow = {
          ...validConfig,
          windowDays: 30,
        };
        expect(() =>
          validateTrackedLabelConfig(configWithWindow, 0),
        ).not.toThrow();
      });

      it("should accept configuration with optional reportAcct", () => {
        const configWithReport = {
          ...validConfig,
          reportAcct: true,
        };
        expect(() =>
          validateTrackedLabelConfig(configWithReport, 0),
        ).not.toThrow();
      });

      it("should accept configuration with optional commentAcct", () => {
        const configWithComment = {
          ...validConfig,
          commentAcct: false,
        };
        expect(() =>
          validateTrackedLabelConfig(configWithComment, 0),
        ).not.toThrow();
      });

      it("should accept configuration with all optional fields", () => {
        const fullConfig = {
          ...validConfig,
          windowDays: 14,
          reportAcct: true,
          commentAcct: true,
        };
        expect(() =>
          validateTrackedLabelConfig(fullConfig, 0),
        ).not.toThrow();
      });
    });

    describe("invalid configurations - not an object", () => {
      it("should reject null", () => {
        expect(() => validateTrackedLabelConfig(null, 0)).toThrow(
          "Configuration at index 0 is not an object",
        );
      });

      it("should reject undefined", () => {
        expect(() => validateTrackedLabelConfig(undefined, 0)).toThrow(
          "Configuration at index 0 is not an object",
        );
      });

      it("should reject string", () => {
        expect(() => validateTrackedLabelConfig("invalid", 0)).toThrow(
          "Configuration at index 0 is not an object",
        );
      });

      it("should reject number", () => {
        expect(() => validateTrackedLabelConfig(42, 0)).toThrow(
          "Configuration at index 0 is not an object",
        );
      });

      it("should reject array", () => {
        expect(() => validateTrackedLabelConfig([], 0)).toThrow(
          "Configuration at index 0 is not an object",
        );
      });
    });

    describe("invalid label field", () => {
      it("should reject missing label", () => {
        const { label, ...configWithoutLabel } = validConfig;
        expect(() =>
          validateTrackedLabelConfig(configWithoutLabel, 0),
        ).toThrow("invalid 'label': must be a non-empty string");
      });

      it("should reject non-string label", () => {
        const config = { ...validConfig, label: 123 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'label': must be a non-empty string",
        );
      });

      it("should reject empty string label", () => {
        const config = { ...validConfig, label: "" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'label': must be a non-empty string",
        );
      });

      it("should reject whitespace-only label", () => {
        const config = { ...validConfig, label: "   " };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'label': must be a non-empty string",
        );
      });
    });

    describe("invalid threshold field", () => {
      it("should reject missing threshold", () => {
        const { threshold, ...configWithoutThreshold } = validConfig;
        expect(() =>
          validateTrackedLabelConfig(configWithoutThreshold, 0),
        ).toThrow("invalid 'threshold': must be a number");
      });

      it("should reject non-number threshold", () => {
        const config = { ...validConfig, threshold: "5" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'threshold': must be a number",
        );
      });

      it("should reject zero threshold", () => {
        const config = { ...validConfig, threshold: 0 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'threshold': must be greater than 0 (got 0)",
        );
      });

      it("should reject negative threshold", () => {
        const config = { ...validConfig, threshold: -5 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'threshold': must be greater than 0 (got -5)",
        );
      });

      it("should reject float threshold", () => {
        const config = { ...validConfig, threshold: 5.5 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'threshold': must be an integer (got 5.5)",
        );
      });
    });

    describe("invalid accountLabel field", () => {
      it("should reject missing accountLabel", () => {
        const { accountLabel, ...configWithoutAccountLabel } = validConfig;
        expect(() =>
          validateTrackedLabelConfig(configWithoutAccountLabel, 0),
        ).toThrow("invalid 'accountLabel': must be a non-empty string");
      });

      it("should reject non-string accountLabel", () => {
        const config = { ...validConfig, accountLabel: 123 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'accountLabel': must be a non-empty string",
        );
      });

      it("should reject empty string accountLabel", () => {
        const config = { ...validConfig, accountLabel: "" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'accountLabel': must be a non-empty string",
        );
      });
    });

    describe("invalid accountComment field", () => {
      it("should reject missing accountComment", () => {
        const { accountComment, ...configWithoutAccountComment } =
          validConfig;
        expect(() =>
          validateTrackedLabelConfig(configWithoutAccountComment, 0),
        ).toThrow("invalid 'accountComment': must be a non-empty string");
      });

      it("should reject non-string accountComment", () => {
        const config = { ...validConfig, accountComment: true };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'accountComment': must be a non-empty string",
        );
      });

      it("should reject empty string accountComment", () => {
        const config = { ...validConfig, accountComment: "" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'accountComment': must be a non-empty string",
        );
      });
    });

    describe("invalid windowDays field", () => {
      it("should reject non-number windowDays", () => {
        const config = { ...validConfig, windowDays: "30" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'windowDays': must be a number",
        );
      });

      it("should reject zero windowDays", () => {
        const config = { ...validConfig, windowDays: 0 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'windowDays': must be greater than 0 (got 0)",
        );
      });

      it("should reject negative windowDays", () => {
        const config = { ...validConfig, windowDays: -7 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'windowDays': must be greater than 0 (got -7)",
        );
      });

      it("should reject float windowDays", () => {
        const config = { ...validConfig, windowDays: 7.5 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'windowDays': must be an integer (got 7.5)",
        );
      });
    });

    describe("invalid reportAcct field", () => {
      it("should reject non-boolean reportAcct", () => {
        const config = { ...validConfig, reportAcct: "true" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'reportAcct': must be a boolean",
        );
      });

      it("should reject number reportAcct", () => {
        const config = { ...validConfig, reportAcct: 1 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'reportAcct': must be a boolean",
        );
      });
    });

    describe("invalid commentAcct field", () => {
      it("should reject non-boolean commentAcct", () => {
        const config = { ...validConfig, commentAcct: "false" };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'commentAcct': must be a boolean",
        );
      });

      it("should reject number commentAcct", () => {
        const config = { ...validConfig, commentAcct: 0 };
        expect(() => validateTrackedLabelConfig(config, 0)).toThrow(
          "invalid 'commentAcct': must be a boolean",
        );
      });
    });

    describe("error messages include index", () => {
      it("should include correct index in error messages", () => {
        const { label, ...configWithoutLabel } = validConfig;
        expect(() =>
          validateTrackedLabelConfig(configWithoutLabel, 42),
        ).toThrow("Configuration at index 42");
      });
    });
  });

});

// Separate describe block with mocked fs for loadTrackedLabels tests
// Uses dynamic imports to avoid module-level initialization issues
describe("loadTrackedLabels", () => {
  const validConfig = [
    {
      label: "spam",
      threshold: 5,
      accountLabel: "repeat-spammer",
      accountComment: "Account has posted spam multiple times",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache between tests
  });

  it("should load and return valid configs", async () => {
    // Mock fs before importing config
    vi.doMock("node:fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(true),
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(validConfig)),
      },
    }));

    const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    // Dynamically import to trigger module initialization with mocks in place
    const { loadTrackedLabels } = await import("../config.js");
    const result = loadTrackedLabels();

    expect(result).toEqual(validConfig);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "✓ Loaded 1 tracked label configuration(s)",
    );
  });

  it("should exit if config file does not exist", async () => {
    vi.doMock("node:fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(false),
        readFileSync: vi.fn(),
      },
    }));

    const mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation((code) => {
        throw new Error(`process.exit(${code})`);
      });
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // The import triggers module initialization which calls loadTrackedLabels
    await expect(async () => await import("../config.js")).rejects.toThrow("process.exit(1)");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("FATAL: tracked-labels.json not found"),
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should exit if config file is invalid JSON", async () => {
    vi.doMock("node:fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(true),
        readFileSync: vi.fn().mockReturnValue("[{,}]"),
      },
    }));

    const mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation((code) => {
        throw new Error(`process.exit(${code})`);
      });
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(async () => await import("../config.js")).rejects.toThrow("process.exit(1)");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "FATAL: tracked-labels.json contains invalid JSON",
      ),
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should exit if config is not an array", async () => {
    vi.doMock("node:fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(true),
        readFileSync: vi.fn().mockReturnValue(JSON.stringify({ not: "an array" })),
      },
    }));

    const mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation((code) => {
        throw new Error(`process.exit(${code})`);
      });
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(async () => await import("../config.js")).rejects.toThrow("process.exit(1)");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("FATAL: tracked-labels.json must contain an array"),
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should exit if a config item is invalid", async () => {
    const invalidConfig = [...validConfig, { label: "bad" }];
    vi.doMock("node:fs", () => ({
      default: {
        existsSync: vi.fn().mockReturnValue(true),
        readFileSync: vi.fn().mockReturnValue(JSON.stringify(invalidConfig)),
      },
    }));

    const mockProcessExit = vi
      .spyOn(process, "exit")
      .mockImplementation((code) => {
        throw new Error(`process.exit(${code})`);
      });
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(async () => await import("../config.js")).rejects.toThrow("process.exit(1)");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("FATAL: Invalid tracked label configuration"),
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
