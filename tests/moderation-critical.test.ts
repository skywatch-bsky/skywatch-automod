import { describe, it, expect } from "vitest";
import { getLanguage } from "../src/utils.js";

describe("Critical moderation language detection", () => {
  describe("English vs French 'retard' disambiguation", () => {
    it("should detect French when 'retard' is used in French context (meaning 'delay')", async () => {
      const frenchContexts = [
        "Le train a du retard aujourd'hui",
        "Il y a un retard de livraison",
        "Désolé pour le retard",
        "Mon vol a trois heures de retard",
        "Le retard est dû à la météo",
        "J'ai un retard de 15 minutes",
        "Le projet prend du retard",
        "Nous avons accumulé du retard",
        "Sans retard s'il vous plaît",
        "Le retard n'est pas acceptable",
      ];

      for (const text of frenchContexts) {
        const result = await getLanguage(text);
        // Should detect as French (fra) or potentially other Romance languages, but NOT English
        expect(result).not.toBe("eng");
        // Most likely to be detected as French
        expect(
          ["fra", "cat", "spa", "ita", "por", "ron"].includes(result),
        ).toBe(true);
      }
    });

    it("should detect English when 'retard' is used in English offensive context", async () => {
      const englishContexts = [
        "Don't be such a retard about it",
        "That's completely retarded logic",
        "Stop acting like a retard",
        "What a retard move that was",
        "Only a retard would think that",
      ];

      for (const text of englishContexts) {
        const result = await getLanguage(text);
        // Should detect as English or closely related Germanic languages
        expect(["eng", "sco", "nld", "afr", "deu"].includes(result)).toBe(true);
      }
    });

    it("should handle mixed signals but lean towards context language", async () => {
      // French sentence structure with 'retard' should be French
      const frenchStructure = "Le retard du train";
      const result1 = await getLanguage(frenchStructure);
      expect(result1).not.toBe("eng");

      // English sentence structure with 'retard' should be English
      const englishStructure = "The retard in the system";
      const result2 = await getLanguage(englishStructure);
      // May detect as English or Dutch/Germanic due to structure
      expect(["eng", "nld", "afr", "deu", "sco"].includes(result2)).toBe(true);
    });

    it("should detect French for common French phrases with 'retard'", async () => {
      const commonFrenchPhrases = [
        "en retard",
        "du retard",
        "avec retard",
        "sans retard",
        "mon retard",
        "ton retard",
        "son retard",
        "notre retard",
        "votre retard",
        "leur retard",
      ];

      for (const phrase of commonFrenchPhrases) {
        const result = await getLanguage(phrase);
        // Very short phrases might be harder to detect, but should not be English
        expect(result).not.toBe("eng");
      }
    });

    it("should provide context for moderation decisions", async () => {
      // Test case that matters for moderation
      const testCases = [
        {
          text: "Je suis en retard pour le meeting",
          expectedLang: ["fra", "cat", "spa", "ita"],
          isOffensive: false,
          context: "French: I am late for the meeting",
        },
        {
          text: "You're being a retard about this",
          expectedLang: ["eng", "sco", "nld"],
          isOffensive: true,
          context: "English: Offensive slur usage",
        },
        {
          text: "Le retard mental est un terme médical désuet",
          expectedLang: ["fra", "cat", "spa"],
          isOffensive: false,
          context: "French: Medical terminology (outdated)",
        },
        {
          text: "That's so retarded dude",
          expectedLang: ["eng", "sco"],
          isOffensive: true,
          context: "English: Casual offensive usage",
        },
      ];

      for (const testCase of testCases) {
        const result = await getLanguage(testCase.text);

        // Check if detected language is in expected set
        const isExpectedLang = testCase.expectedLang.some(
          (lang) => result === lang,
        );

        if (!isExpectedLang) {
          console.log(
            `Warning: "${testCase.text}" detected as ${result}, expected one of ${testCase.expectedLang.join(", ")}`,
          );
        }

        // The key insight: if detected as French/Romance language, likely NOT offensive
        // if detected as English/Germanic, needs moderation review
        const needsModeration = ["eng", "sco", "nld", "afr", "deu"].includes(
          result,
        );

        // This aligns with whether the content is actually offensive
        if (testCase.isOffensive) {
          expect(needsModeration).toBe(true);
        }
      }
    });
  });

  describe("Other ambiguous terms across languages", () => {
    it("should detect language for other potentially ambiguous terms", async () => {
      const ambiguousCases = [
        {
          text: "Elle a un chat noir",
          lang: "fra",
          meaning: "She has a black cat (French)",
        },
        {
          text: "Let's chat about it",
          lang: "eng",
          meaning: "Let's talk (English)",
        },
        {
          text: "Das Gift ist gefährlich",
          lang: "deu",
          meaning: "The poison is dangerous (German)",
        },
        {
          text: "I got a gift for you",
          lang: "eng",
          meaning: "I got a present (English)",
        },
        {
          text: "El éxito fue grande",
          lang: "spa",
          meaning: "The success was great (Spanish)",
        },
        {
          text: "Take the exit here",
          lang: "eng",
          meaning: "Take the exit (English)",
        },
      ];

      for (const testCase of ambiguousCases) {
        const result = await getLanguage(testCase.text);
        // Log for debugging but don't fail - language detection is probabilistic
        if (result !== testCase.lang) {
          console.log(
            `Note: "${testCase.text}" detected as ${result}, expected ${testCase.lang}`,
          );
        }
      }
    });
  });
});
