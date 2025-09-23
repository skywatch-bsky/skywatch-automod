# PRD: PDS Host Check Module

## 1. Objective

To enhance account monitoring capabilities by implementing a new module that checks the Personal Data Server (PDS) hosting a user'''s account upon creation. This will allow for the identification and moderation of accounts originating from malicious or untrusted PDS instances.

## 2. Background

The platform'''s decentralized nature allows users to create accounts on various PDS instances. While this offers flexibility, it also presents a challenge in controlling the influx of malicious actors who may use specific PDS hosts to create spam or abusive accounts. By checking the PDS host at the time of account creation, we can proactively identify and take action on accounts from known bad sources. This module will follow the established design patterns of other `check*` modules in the system.

## 3. Requirements

*   A new module file, `src/checkPDS.ts`, will be created.
*   The module will check the `endpoint` and `alsoKnownAs` fields associated with a user'''s account.
*   A new check array, `PDS_CHECKS`, will be defined in `src/constants.ts`.
*   The `PDS_CHECKS` array will contain objects with the following properties:
    *   `label`: A string to identify the check.
    *   `comment`: A string to be used in moderation comments/reports.
    *   `check`: A regular expression to match against the PDS endpoint or `alsoKnownAs` fields.
    *   `whitelist`: An optional regular expression to prevent false positives.
    *   `ignoredDIDs`: An optional array of DIDs to ignore.
    *   `toLabel`: A boolean indicating whether to apply a label to the account.
    *   `reportAcct`: A boolean indicating whether to report the account.
    *   `commentAcct`: A boolean indicating whether to add a comment to the account.
*   The new `checkPDS` function will be integrated into the main agent logic to be triggered on account creation events.

## 5. Out of Scope

*   This module will only check PDS information at the time of account creation. It will not retroactively scan existing accounts.
*   This module will not be responsible for determining if a PDS is malicious, it will only act on the predefined rules in `PDS_CHECKS`. The population and maintenance of these rules are a separate operational task.
