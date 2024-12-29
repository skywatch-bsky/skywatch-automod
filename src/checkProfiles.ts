import {
  magaTrumpProfile,
  trollProfile,
  nazism,
  elonMusk,
  swastika,
  hammerAndSickle,
  slur,
  slurWhiteList,
} from "./constants.js";
import { IGNORED_DIDS } from "./whitelist.js";
import logger from "./logger.js";
import {
  addToList,
  createAccountComment,
  createAccountLabel,
} from "./moderation.js";

export const checkProfile = async (
  did: string,
  time: number,
  displayName: string,
  description: string,
) => {
  if (IGNORED_DIDS.includes(did)) {
    return logger.info(`Ignoring DID: ${did}`);
  } else {
    /*const displayName = normalizeUnicode(displayName);*/

    /*if (
      magaTrumpProfile.test(displayName) ||
      magaTrumpProfile.test(description)
    ) {
      logger.info("Trump in profile");
      createAccountLabel(
        did,
        "maga-trump",
        `${time}: MAGA/Trump in profile: ${displayName} - ${description}`,
      );*/

      addToList("maga-trump", did);
    }
    if (trollProfile.test(displayName) || trollProfile.test(description)) {
      logger.info("Troll reference in profile");
      createAccountLabel(
        did,
        "troll",
        `${time}: Troll in profile: ${displayName} - ${description}`,
      );

      addToList("troll", did);
    }
    if (elonMusk.test(displayName)) {
      logger.info("Elon Musk in profile");
      createAccountLabel(
        did,
        "elon-musk",
        `${time}: Elon Musk in profile: ${displayName}`,
      );

      addToList("elon-musk", did);
    }
    if (swastika.test(displayName) || swastika.test(description)) {
      logger.info("Swastika in profile");
      createAccountLabel(
        did,
        "nazi-symbolism",
        `${time}: Swastika in profile: ${displayName} - ${description}`,
      );

      addToList("nazi-symbolism", did);
    }
    if (slurWhiteList.test(displayName) || slurWhiteList.test(description)) {
      logger.info(
        "User is probably Scottish, a golfer, or works for the vineyard in Oregon",
      ); // I swear to god.
      createAccountComment(
        did,
        `${time}: User is Scottish: ${displayName} - ${description}`,
      );
    } else {
      if (slur.test(displayName) || slur.test(description)) {
        logger.info("slur in profile");
        createAccountLabel(
          did,
          "contains-slur",
          `${time}: Slur in profile: ${displayName} - ${description}`,
        );
      }
    }
    if (
      hammerAndSickle.test(displayName) ||
      hammerAndSickle.test(description)
    ) {
      logger.info("Hammer and sickle in profile");
      createAccountLabel(
        did,
        "hammer-sickle",
        `${time}: Hammer and sickle in profile: ${displayName} - ${description}`,
      );

      addToList("hammer-sickle", did);
    }
  }

  /*  Normalize the Unicode characters: this doesn't consistently work yet, there is something about certain bluesky strings that causes it to fail. */
  function normalizeUnicode(text: string): string {
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
