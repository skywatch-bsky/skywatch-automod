# `normalizeUnicode.ts` and `homoglyphs.ts`

These two modules work together to sanitize and normalize text. This is a crucial step before checking text against moderation rule patterns, as it prevents users from evading detection by using visually similar characters (homoglyphs), different cases, or diacritics.

## `homoglyphs.ts`

This file contains a single, large constant:

-   **`homoglyphMap`**: A `Record<string, string>` that maps various Unicode characters to their basic ASCII equivalents.

This map is the dictionary used for normalization. It includes:
-   **Accented characters**: `é`, `à`, `ü` -> `e`, `a`, `u`
-   **Look-alike symbols**: `@` -> `a`, `3` -> `e`, `0` -> `o`
-   **Cyrillic characters**: `а` (Cyrillic 'a') -> `a` (Latin 'a')
-   **Full-width characters**: `ａ` -> `a`
-   And many other "confusable" characters.

## `normalizeUnicode.ts`

This file provides the function that performs the normalization using the `homoglyphMap`.

### Key Function

#### `normalizeUnicode(text: string): string`

This function takes a string and returns a "flattened" version of it in a predictable, normalized form.

**Parameters:**

-   `text`: The input string to be normalized.

**Returns:**

-   A `string` that has been normalized.

**Normalization Process:**

The function applies a multi-step process to the input string:

1.  **Lowercase**: The entire string is converted to lowercase. This ensures that checks are case-insensitive.
2.  **Homoglyph Replacement**: It iterates through each character of the lowercased string and replaces it with its ASCII equivalent from the `homoglyphMap` if a mapping exists. This is done *before* Unicode decomposition to catch pre-composed characters that are also used as homoglyphs.
3.  **Decomposition (NFD)**: It applies Unicode Normalization Form D (`.normalize("NFD")`). This separates base characters from their combining marks. For example, `é` becomes `e` + `´` (combining acute accent).
4.  **Diacritic Removal**: It uses a regular expression (`/[\u0300-\u036f]/g`) to strip out all Unicode combining diacritical marks, leaving only the base characters.
5.  **Compatibility Normalization (NFKC)**: As a final step, it applies Unicode Normalization Form KC (`.normalize("NFKC")`). This handles a broader range of compatibility characters (e.g., converting ligatures like `ﬁ` into `fi`) to ensure the string is in its simplest, most comparable form.

This robust process ensures that a string like `"P@sswоrd"` (with a capital P, an @ symbol, and a Cyrillic 'o') is converted to `"password"`, which can then be easily matched against a rule.
