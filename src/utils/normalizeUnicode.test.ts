import { describe, expect, it } from "vitest";
import { normalizeUnicode } from "./normalizeUnicode.js";

describe("normalizeUnicode", () => {
  describe("lowercase conversion", () => {
    it("should convert uppercase to lowercase", () => {
      expect(normalizeUnicode("HELLO")).toBe("hello");
      expect(normalizeUnicode("WoRlD")).toBe("world");
    });
  });

  describe("homoglyph replacement", () => {
    it("should replace homoglyphs with ASCII equivalents", () => {
      expect(normalizeUnicode("h3ll0")).toBe("hello");
      expect(normalizeUnicode("t3st")).toBe("test");
      expect(normalizeUnicode("@ppl3")).toBe("apple");
    });

    it("should replace accented characters", () => {
      expect(normalizeUnicode("café")).toBe("cafe");
      expect(normalizeUnicode("naïve")).toBe("naive");
      expect(normalizeUnicode("résumé")).toBe("resume");
    });

    it("should handle cyrillic lookalikes", () => {
      expect(normalizeUnicode("tеst")).toBe("test"); // е is cyrillic
      expect(normalizeUnicode("пight")).toBe("night"); // п is cyrillic
    });
  });

  describe("diacritic removal", () => {
    it("should remove combining diacritical marks", () => {
      expect(normalizeUnicode("e\u0301")).toBe("e"); // e with combining acute accent
      expect(normalizeUnicode("a\u0300")).toBe("a"); // a with combining grave accent
    });

    it("should handle precomposed characters", () => {
      expect(normalizeUnicode("é")).toBe("e");
      expect(normalizeUnicode("ñ")).toBe("n");
      expect(normalizeUnicode("ü")).toBe("u");
    });
  });

  describe("unicode normalization", () => {
    it("should normalize compatibility characters", () => {
      expect(normalizeUnicode("ﬁ")).toBe("fi"); // ligature fi
      expect(normalizeUnicode("ａ")).toBe("a"); // fullwidth a
    });

    it("should handle complex unicode sequences", () => {
      const input = "Ḧëḷḷö Ẅöṛḷḋ";
      const expected = "hello world";
      expect(normalizeUnicode(input)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      expect(normalizeUnicode("")).toBe("");
    });

    it("should handle strings with only spaces", () => {
      expect(normalizeUnicode("   ")).toBe("   ");
    });

    it("should preserve non-mapped characters", () => {
      expect(normalizeUnicode("hello@")).toBe("helloa"); // @ maps to a
    });

    it("should handle mixed scripts", () => {
      const input = "hëllö wörld";
      expect(normalizeUnicode(input)).toBe("hello world");
    });

    it("should be idempotent", () => {
      const input = "tést";
      const normalized = normalizeUnicode(input);
      expect(normalizeUnicode(normalized)).toBe(normalized);
    });
  });

  describe("real-world examples", () => {
    it("should normalize common slur evasion techniques", () => {
      expect(normalizeUnicode("f@gg0t")).toBe("faggot");
      expect(normalizeUnicode("n1gg3r")).toBe("nigger");
      expect(normalizeUnicode("k1k3")).toBe("kike");
    });

    it("should normalize unicode evasion techniques", () => {
      expect(normalizeUnicode("fаggоt")).toBe("faggot"); // cyrillic а and о
      expect(normalizeUnicode("nіggеr")).toBe("nigger"); // cyrillic і and е
    });

    it("should handle multiple evasion techniques combined", () => {
      expect(normalizeUnicode("F@GG0Т")).toBe("faggot"); // mixed case, numbers, cyrillic
      expect(normalizeUnicode("n1ggёr")).toBe("nigger"); // numbers and cyrillic
    });
  });
});
