import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLanguage } from "./getLanguage.js";

// Mock the logger
vi.mock("../logger.js", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

describe("getLanguage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("language detection", () => {
    it("should detect English text", async () => {
      const text = "Hello world, this is a test of the English language.";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });

    it("should detect Spanish text", async () => {
      const text =
        "Hola mundo, esta es una prueba del idioma español con suficiente texto para detectar.";
      const result = await getLanguage(text);
      expect(result).toBe("spa");
    });

    it("should detect French text", async () => {
      const text =
        "Bonjour le monde, ceci est un test de la langue française avec suffisamment de texte.";
      const result = await getLanguage(text);
      expect(result).toBe("fra");
    });

    it("should detect German text", async () => {
      const text =
        "Hallo Welt, dies ist ein Test der deutschen Sprache mit genügend Text.";
      const result = await getLanguage(text);
      expect(result).toBe("deu");
    });

    it("should detect Portuguese text", async () => {
      const text =
        "Olá mundo, este é um teste da língua portuguesa com texto suficiente para detecção.";
      const result = await getLanguage(text);
      expect(result).toBe("por");
    });

    it("should detect Italian text", async () => {
      const text =
        "Ciao mondo, questo è un test della lingua italiana con abbastanza testo.";
      const result = await getLanguage(text);
      expect(result).toBe("ita");
    });

    it("should detect Japanese text", async () => {
      const text =
        "これは日本語のテストです。十分なテキストで言語を検出します。";
      const result = await getLanguage(text);
      expect(result).toBe("jpn");
    });
  });

  describe("edge cases", () => {
    it("should default to eng for empty strings", async () => {
      const result = await getLanguage("");
      expect(result).toBe("eng");
    });

    it("should default to eng for whitespace-only strings", async () => {
      const result = await getLanguage("   ");
      expect(result).toBe("eng");
    });

    it("should default to eng for very short text", async () => {
      const result = await getLanguage("hi");
      expect(result).toBe("eng");
    });

    it("should default to eng for undetermined language", async () => {
      const result = await getLanguage("123 456 789");
      expect(result).toBe("eng");
    });

    it("should default to eng for symbols only", async () => {
      const result = await getLanguage("!@#$%^&*()");
      expect(result).toBe("eng");
    });
  });

  describe("invalid input handling", () => {
    it("should handle non-string input gracefully", async () => {
      const result = await getLanguage(123 as any);
      expect(result).toBe("eng");
    });

    it("should handle null input gracefully", async () => {
      const result = await getLanguage(null as any);
      expect(result).toBe("eng");
    });

    it("should handle undefined input gracefully", async () => {
      const result = await getLanguage(undefined as any);
      expect(result).toBe("eng");
    });

    it("should handle object input gracefully", async () => {
      const result = await getLanguage({} as any);
      expect(result).toBe("eng");
    });

    it("should handle array input gracefully", async () => {
      const result = await getLanguage([] as any);
      expect(result).toBe("eng");
    });
  });

  describe("trimming behavior", () => {
    it("should trim leading whitespace", async () => {
      const text = "   Hello world, this is a test of the English language.";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });

    it("should trim trailing whitespace", async () => {
      const text = "Hello world, this is a test of the English language.   ";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });

    it("should trim both leading and trailing whitespace", async () => {
      const text = "   Hello world, this is a test of the English language.   ";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });
  });

  describe("mixed language text", () => {
    it("should detect primary language in mixed content", async () => {
      const text =
        "This is primarily English text with some español words mixed in.";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });

    it("should handle code mixed with text", async () => {
      const text = "Here is some English text with const x = 123; code in it.";
      const result = await getLanguage(text);
      expect(result).toBe("eng");
    });
  });
});
