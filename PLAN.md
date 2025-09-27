# Implementation Plan: Replace lande with franc

## Overview
Replace the `lande` library with `franc` for language detection in the `getLanguage` function located in `src/utils.ts`.

## Current State Analysis
- **Current Library**: `lande` v1.0.10
- **Function Location**: `src/utils.ts:67-92`
- **Current Implementation**:
  - Uses dynamic import: `const lande = (await import("lande")).default;`
  - Returns a probability map sorted by likelihood
  - Returns the language code with highest probability
  - Defaults to "eng" for empty or invalid input

## Implementation Steps

### 1. Research & Dependencies
- **franc** is a natural language detection library similar to `lande`
- Supports 187 languages (ISO 639-3 codes)
- Smaller footprint and better maintained than `lande`
- Returns ISO 639-3 codes (3-letter codes like "eng", "fra", "spa")

### 2. Code Changes Required

#### Step 2.1: Update package.json
- Remove: `"lande": "^1.0.10"`
- Add: `"franc": "^6.2.0"` (latest stable version)

#### Step 2.2: Modify getLanguage function
```typescript
// Before (lines 82-92)
const lande = (await import("lande")).default;
let langsProbabilityMap = lande(profileText);
langsProbabilityMap.sort(...);
return langsProbabilityMap[0][0];

// After
const { franc } = await import("franc");
const detectedLang = franc(profileText);
return detectedLang === "und" ? "eng" : detectedLang;
```

### 3. Key Differences & Considerations

#### API Differences:
- **lande**: Returns array of `[language, probability]` tuples
- **franc**: Returns single language code or "und" (undetermined)

#### Return Values:
- Both libraries use ISO 639-3 codes (3-letter codes)
- franc returns "und" for undetermined text (we'll map to "eng" default)

### 4. Testing Strategy
1. Test with empty string → should return "eng"
2. Test with invalid input (null/undefined) → should return "eng"
3. Test with English text → should return "eng"
4. Test with other language samples → verify correct detection
5. Test with mixed language text → verify reasonable detection

### 5. Rollback Plan
If issues arise:
1. Keep the original `lande` code commented
2. Can quickly revert by uncommenting old code and reinstalling `lande`

## Implementation Order
1. ✅ Analyze current implementation
2. ✅ Research franc library compatibility
3. 📝 Create this implementation plan
4. Update package.json to replace lande with franc
5. Modify getLanguage function in src/utils.ts
6. Run lint and format checks
7. Test the changes manually or with existing tests

## Risk Assessment
- **Low Risk**: Direct replacement with similar functionality
- **Compatibility**: Both libraries use ISO 639-3 codes
- **Performance**: franc is generally faster and lighter
- **Maintenance**: franc is more actively maintained