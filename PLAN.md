# Implementation Plan: Label Determination

## 1. Objective

To enhance account monitoring capabilities by implementing a new function that checks if an account or post already has a specific label applied. If the label is already present, the function will return `true`, allowing the parent function to avoid reapplying it.

## 2. Implementation Steps

### Step 1: Create `checkAccountLabels` function in `src/moderation.ts`

- **Function Signature:** `export const checkAccountLabels = async (did: string, label: string): Promise<boolean> => { ... }`
- **Logic:**
    1.  Incorporate a rate limiter from `src/limits.ts`.
    2.  In a `try...catch` block:
        1. Call the `tools.ozone.moderation.getRepo` endpoint with the provided `did`.
        2. Iterate through the `labels` array in the response.
        3. If a label with a `val` matching the input `label` is found, return `true`.
        4. If the loop completes without finding a matching label, return `false`.
    3. If an error is caught, log it and return `false` to allow processing to continue.

### Step 2: Create `checkRecordLabels` function in `src/moderation.ts`

- **Function Signature:** `export const checkRecordLabels = async (uri: string, label: string): Promise<boolean> => { ... }`
- **Logic:**
    1.  Incorporate a rate limiter from `src/limits.ts`.
    2.  In a `try...catch` block:
        1. Call the `tools.ozone.moderation.getRecord` endpoint with the provided `uri`.
        2. Iterate through the `labels` array in the response.
        3. If a label with a `val` matching the input `label` is found, return `true`.
        4. If the loop completes without finding a matching label, return `false`.
    3. If an error is caught, log it and return `false` to allow processing to continue.

### Step 3: Add Tests

- Create a new test file `src/__tests__/moderation.test.ts`.
- Add test cases for both `checkAccountLabels` and `checkRecordLabels`:
    - Test case where the label exists.
    - Test case where the label does not exist.
    - Test case for API errors (should return `false`).

### Step 4: Update `checkHandles.ts` and `checkPosts.ts`

- Import the new functions in `checkHandles.ts` and `checkPosts.ts`.
- Before applying a label, call the appropriate check function.
- If the function returns `true`, log a message and skip applying the label.