import {
  magaTrump,
  troll,
  nazism,
  elonMusk,
  swastika,
  hammerAndSickle,
} from "./constants.js";
import { Profile } from "./types.js";
import logger from "./logger.js";
import { createAccountLabel } from "./moderation.js";

export const checkProfile = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  if (IGNORED_DIDS.includes(did)) {
    return logger.info(`Ignoring DID: ${did}`);
  } else if (swastika.test(displayName) || swastika.test(description)) {
    /*
  const displayNameNormalized = normalizeUnicode(displayName);
  const descriptionNormalized = normalizeUnicode(description);

   if (
    magaTrump.test(displayNameNormalized) ||
    magaTrump.test(descriptionNormalized)
  ) {
    createAccountLabel(
      did,
      "maga-trump",
      `${time}: MAGA/Trump in profile: ${displayName} - ${description}`,
    );
  }
  if (troll.test(displayNameNormalized) || troll.test(descriptionNormalized))
      createAccountLabel(
        did,
        "troll",
        `${time}: Troll in profile: ${displayName} - ${description}`,
      );
  }
  if (
    nazism.test(displayNameNormalized) ||
    nazism.test(descriptionNormalized)
  ) {
    createAccountLabel(
      did,
      "nazi-symbolism",
      `${time}: Nazism in profile: ${displayName} - ${description}`,
    );
  }
  if (
    elonMusk.test(displayNameNormalized) ||
    elonMusk.test(descriptionNormalized)
  ) {
    createAccountLabel(
      did,
      "elon-musk",
      `${time}: Elon Musk in profile: ${displayName} - ${description}`,
    );
  }*/

    logger.info("Swastika in profile");
    createAccountLabel(
      did,
      "nazi-symbolism",
      `${time}: Swastika in profile: ${displayName} - ${description}`,
    );
  }
  if (hammerAndSickle.test(displayName) || hammerAndSickle.test(description)) {
    logger.info("Hammer and sickle in profile");
    createAccountLabel(
      did,
      "hammer-sickle",
      `${time}: Hammer and sickle in profile: ${displayName} - ${description}`,
    );
  }

  // Normalize the Unicode characters
  function normalizeUnicode(text) {
    // First decompose the characters (NFD)
    const decomposed = text.normalize("NFD");

    // Remove diacritics and combining marks
    const withoutDiacritics = decomposed.replace(/[\u0300-\u036f]/g, "");

    // Remove mathematical alphanumeric symbols
    const withoutMath = withoutDiacritics.replace(
      /[\uD835][\uDC00-\uDFFF]/g,
      (char) => {
        // Get the base character from the mathematical symbol
        const code = char.codePointAt(0);
        if (code >= 0x1d400 && code <= 0x1d433)
          // Mathematical bold
          return String.fromCharCode(code - 0x1d400 + 0x41);
        if (code >= 0x1d434 && code <= 0x1d467)
          // Mathematical italic
          return String.fromCharCode(code - 0x1d434 + 0x61);
        if (code >= 0x1d468 && code <= 0x1d49b)
          // Mathematical bold italic
          return String.fromCharCode(code - 0x1d468 + 0x41);
        if (code >= 0x1d49c && code <= 0x1d4cf)
          // Mathematical script
          return String.fromCharCode(code - 0x1d49c + 0x61);
        return char;
      },
    );

    // Final NFKC normalization to handle any remaining special characters
    return withoutMath.normalize("NFKC");
  }
};
