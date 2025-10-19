# How to build checks for skywatch-automod

## Introduction

Constants.ts defines three types of types of checks: `HANDLE_CHECKS`, `POST_CHECKS`, and `PROFILE_CHECKS`.

For each check, users need to define a set of regular expressions that will be used to match against the content of the post, handle, or profile. A maximal example of a check is as follows:

```typescript
export const HANDLE_CHECKS: Checks[] = [
  {
    label: "example",
    comment: "Example found in handle",
    description: true, // Optional, only used in handle checks
    displayName: true, // Optional, only used in handle checks
    reportOnly: false, // it true, the check will only report the content against the account, not label.
    commentOnly: false, // Poorly named, if true, will generate an account level comment from flagged posts, rather than a report. Intended for use when reportOnly is false, and on posts only where the flag may generate a high volume of reports..
    check: new RegExp("example", "i"), // Regular expression to match against the content
    whitelist: new RegExp("example.com", "i"), // Optional, regular expression to whitelist content
    ignoredDIDs: ["did:plc:example"], // Optional, array of DIDs to ignore if they match the check. Useful for folks who reclaim words.
  },
];
```

In the above example, any handle that contains the word "example" will be labeled with the label "example" unless the handle is `example.com` or the handle belongs to the user with the DID `did:plc:example`.
