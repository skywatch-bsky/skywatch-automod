import { logger } from "../logger.js";

export async function getLanguage(profile: string): Promise<string> {
  if (typeof profile !== "string") {
    logger.warn(
      { process: "UTILS", profile },
      "getLanguage called with invalid profile data, defaulting to 'eng'",
    );
    return "eng"; // Default or throw an error
  }

  const profileText = profile.trim();

  if (profileText.length === 0) {
    return "eng";
  }

  const { franc } = await import("franc");
  const detectedLang = franc(profileText);

  // franc returns "und" (undetermined) if it can't detect the language
  // Default to "eng" in such cases
  return detectedLang === "und" ? "eng" : detectedLang;
}
