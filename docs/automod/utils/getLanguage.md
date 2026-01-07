# `getLanguage.ts`

This utility module provides a simple function to detect the language of a given string of text. It is used to filter content so that language-specific moderation rules are only applied to relevant posts or profiles.

## Key Function

### `getLanguage(profile: string): Promise<string>`

This function takes a string and returns a three-letter ISO 639-3 language code.

**Parameters:**

-   `profile`: The input string to analyze. Despite the parameter name, it can be any text content (e.g., post text, profile description).

**Returns:**

-   A `Promise` that resolves to a string containing the detected language code (e.g., `"eng"`, `"spa"`, `"jpn"`).
-   It defaults to `"eng"` if the language cannot be determined or if the input is invalid.

**Logic:**

1.  **Input Validation**: It first checks if the input `profile` is actually a string. If not, it logs a warning and returns the default value `"eng"`.
2.  **Trimming**: It trims any leading or trailing whitespace from the input string.
3.  **Empty Check**: If the resulting string is empty, it returns `"eng"`.
4.  **Language Detection**:
    -   It dynamically imports the `franc` library. `franc` is a language detection library that supports a wide range of languages.
    -   It calls `franc(profileText)` to get the language code.
5.  **Handle Undetermined Cases**:
    -   `franc` returns the string `"und"` (for "undetermined") if it cannot reliably detect the language (e.g., for very short text, text with mixed languages, or text with only numbers/symbols).
    -   The function checks for this case and returns the default `"eng"` if the detected language is `"und"`.
    -   Otherwise, it returns the detected language code.

## Dependencies

-   **`franc`**: A lightweight and fast language detection library. It is dynamically imported to reduce initial load time.
-   **`../logger.js`**: For logging warnings about invalid input.
