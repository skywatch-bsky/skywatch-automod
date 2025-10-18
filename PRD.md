# PRD: Label Determination

## 1. Objective

To enhance account monitoring capabilities by implementing a new function that first checks that the account or post under consideration does not have the current label already applied. If already applied, the the function will return false, allowing the parent function to return early.

## 2. Background

Skywatch automatically applies labels to accounts and posts, however, it does not check to ensure the account does not already have the label applied, which can have downstream ramifications. Labels are available via the `tools.ozone.moderation.getRecord` and `tools.ozone.moderation.getRepo` endpoints.

`tools.ozone.moderation.getRecord` accepts the values `uri` and `cid` and returns a schema illustrated by the following example:

```json
{
  "uri": "string",
  "cid": "string",
  "value": {},
  "blobs": [
    {
      "cid": "string",
      "mimeType": "string",
      "size": 0,
      "createdAt": "2024-07-29T15:51:28.071Z",
      "details": {
        "width": 0,
        "height": 0
      },
      "moderation": {
        "subjectStatus": {
          "id": 0,
          "subject": {
            "did": "string"
          },
          "hosting": {
            "status": "takendown",
            "updatedAt": "2024-07-29T15:51:28.071Z",
            "createdAt": "2024-07-29T15:51:28.071Z",
            "deletedAt": "2024-07-29T15:51:28.071Z",
            "deactivatedAt": "2024-07-29T15:51:28.071Z",
            "reactivatedAt": "2024-07-29T15:51:28.071Z"
          },
          "subjectBlobCids": [
            "string"
          ],
          "subjectRepoHandle": "string",
          "updatedAt": "2024-07-29T15:51:28.071Z",
          "createdAt": "2024-07-29T15:51:28.071Z",
          "reviewState": "#reviewOpen",
          "comment": "string",
          "priorityScore": 0,
          "muteUntil": "2024-07-29T15:51:28.071Z",
          "muteReportingUntil": "2024-07-29T15:51:28.071Z",
          "lastReviewedBy": "string",
          "lastReviewedAt": "2024-07-29T15:51:28.071Z",
          "lastReportedAt": "2024-07-29T15:51:28.071Z",
          "lastAppealedAt": "2024-07-29T15:51:28.071Z",
          "takendown": true,
          "appealed": true,
          "suspendUntil": "2024-07-29T15:51:28.071Z",
          "tags": [
            "string"
          ],
          "accountStats": {
            "reportCount": 0,
            "appealCount": 0,
            "suspendCount": 0,
            "escalateCount": 0,
            "takedownCount": 0
          },
          "recordsStats": {
            "totalReports": 0,
            "reportedCount": 0,
            "escalatedCount": 0,
            "appealedCount": 0,
            "subjectCount": 0,
            "pendingCount": 0,
            "processedCount": 0,
            "takendownCount": 0
          }
        }
      }
    }
  ],
  "labels": [
    {
      "ver": 0,
      "src": "string",
      "uri": "string",
      "cid": "string",
      "val": "string",
      "neg": true,
      "cts": "2024-07-29T15:51:28.071Z",
      "exp": "2024-07-29T15:51:28.071Z",
      "sig": "string"
    }
  ],
  "indexedAt": "2024-07-29T15:51:28.071Z",
  "moderation": {
    "subjectStatus": {
      "id": 0,
      "subject": {
        "did": "string"
      },
      "hosting": {
        "status": "takendown",
        "updatedAt": "2024-07-29T15:51:28.071Z",
        "createdAt": "2024-07-29T15:51:28.071Z",
        "deletedAt": "2024-07-29T15:51:28.071Z",
        "deactivatedAt": "2024-07-29T15:51:28.071Z",
        "reactivatedAt": "2024-07-29T15:51:28.071Z"
      },
      "subjectBlobCids": [
        "string"
      ],
      "subjectRepoHandle": "string",
      "updatedAt": "2024-07-29T15:51:28.071Z",
      "createdAt": "2024-07-29T15:51:28.071Z",
      "reviewState": "#reviewOpen",
      "comment": "string",
      "priorityScore": 0,
      "muteUntil": "2024-07-29T15:51:28.071Z",
      "muteReportingUntil": "2024-07-29T15:51:28.071Z",
      "lastReviewedBy": "string",
      "lastReviewedAt": "2024-07-29T15:51:28.071Z",
      "lastReportedAt": "2024-07-29T15:51:28.071Z",
      "lastAppealedAt": "2024-07-29T15:51:28.071Z",
      "takendown": true,
      "appealed": true,
      "suspendUntil": "2024-07-29T15:51:28.071Z",
      "tags": [
        "string"
      ],
      "accountStats": {
        "reportCount": 0,
        "appealCount": 0,
        "suspendCount": 0,
        "escalateCount": 0,
        "takedownCount": 0
      },
      "recordsStats": {
        "totalReports": 0,
        "reportedCount": 0,
        "escalatedCount": 0,
        "appealedCount": 0,
        "subjectCount": 0,
        "pendingCount": 0,
        "processedCount": 0,
        "takendownCount": 0
      }
    }
  },
  "repo": {
    "did": "string",
    "handle": "string",
    "email": "string",
    "relatedRecords": [
      null
    ],
    "indexedAt": "2024-07-29T15:51:28.071Z",
    "moderation": {
      "subjectStatus": {
        "id": 0,
        "subject": {
          "did": "string"
        },
        "hosting": {
          "status": "takendown",
          "updatedAt": "2024-07-29T15:51:28.071Z",
          "createdAt": "2024-07-29T15:51:28.071Z",
          "deletedAt": "2024-07-29T15:51:28.071Z",
          "deactivatedAt": "2024-07-29T15:51:28.071Z",
          "reactivatedAt": "2024-07-29T15:51:28.071Z"
        },
        "subjectBlobCids": [
          "string"
        ],
        "subjectRepoHandle": "string",
        "updatedAt": "2024-07-29T15:51:28.071Z",
        "createdAt": "2024-07-29T15:51:28.071Z",
        "reviewState": "#reviewOpen",
        "comment": "string",
        "priorityScore": 0,
        "muteUntil": "2024-07-29T15:51:28.071Z",
        "muteReportingUntil": "2024-07-29T15:51:28.071Z",
        "lastReviewedBy": "string",
        "lastReviewedAt": "2024-07-29T15:51:28.071Z",
        "lastReportedAt": "2024-07-29T15:51:28.071Z",
        "lastAppealedAt": "2024-07-29T15:51:28.071Z",
        "takendown": true,
        "appealed": true,
        "suspendUntil": "2024-07-29T15:51:28.071Z",
        "tags": [
          "string"
        ],
        "accountStats": {
          "reportCount": 0,
          "appealCount": 0,
          "suspendCount": 0,
          "escalateCount": 0,
          "takedownCount": 0
        },
        "recordsStats": {
          "totalReports": 0,
          "reportedCount": 0,
          "escalatedCount": 0,
          "appealedCount": 0,
          "subjectCount": 0,
          "pendingCount": 0,
          "processedCount": 0,
          "takendownCount": 0
        }
      }
    },
    "invitedBy": {
      "code": "string",
      "available": 0,
      "disabled": true,
      "forAccount": "string",
      "createdBy": "string",
      "createdAt": "2024-07-29T15:51:28.071Z",
      "uses": [
        {
          "usedBy": "string",
          "usedAt": "2024-07-29T15:51:28.071Z"
        }
      ]
    },
    "invitesDisabled": true,
    "inviteNote": "string",
    "deactivatedAt": "2024-07-29T15:51:28.071Z",
    "threatSignatures": [
      {
        "property": "string",
        "value": "string"
      }
    ]
  }
}
```

`tools.ozone.moderation.getRepo` accepts the value `did` and returns a schema illustrated by the following example:

```json
{
  "did": "string",
  "handle": "string",
  "email": "string",
  "relatedRecords": [
    null
  ],
  "indexedAt": "2024-07-29T15:51:28.071Z",
  "moderation": {
    "subjectStatus": {
      "id": 0,
      "subject": {
        "did": "string"
      },
      "hosting": {
        "status": "takendown",
        "updatedAt": "2024-07-29T15:51:28.071Z",
        "createdAt": "2024-07-29T15:51:28.071Z",
        "deletedAt": "2024-07-29T15:51:28.071Z",
        "deactivatedAt": "2024-07-29T15:51:28.071Z",
        "reactivatedAt": "2024-07-29T15:51:28.071Z"
      },
      "subjectBlobCids": [
        "string"
      ],
      "subjectRepoHandle": "string",
      "updatedAt": "2024-07-29T15:51:28.071Z",
      "createdAt": "2024-07-29T15:51:28.071Z",
      "reviewState": "#reviewOpen",
      "comment": "string",
      "priorityScore": 0,
      "muteUntil": "2024-07-29T15:51:28.071Z",
      "muteReportingUntil": "2024-07-29T15:51:28.071Z",
      "lastReviewedBy": "string",
      "lastReviewedAt": "2024-07-29T15:51:28.071Z",
      "lastReportedAt": "2024-07-29T15:51:28.071Z",
      "lastAppealedAt": "2024-07-29T15:51:28.071Z",
      "takendown": true,
      "appealed": true,
      "suspendUntil": "2024-07-29T15:51:28.071Z",
      "tags": [
        "string"
      ],
      "accountStats": {
        "reportCount": 0,
        "appealCount": 0,
        "suspendCount": 0,
        "escalateCount": 0,
        "takedownCount": 0
      },
      "recordsStats": {
        "totalReports": 0,
        "reportedCount": 0,
        "escalatedCount": 0,
        "appealedCount": 0,
        "subjectCount": 0,
        "pendingCount": 0,
        "processedCount": 0,
        "takendownCount": 0
      }
    }
  },
  "labels": [
    {
      "ver": 0,
      "src": "string",
      "uri": "string",
      "cid": "string",
      "val": "string",
      "neg": true,
      "cts": "2024-07-29T15:51:28.071Z",
      "exp": "2024-07-29T15:51:28.071Z",
      "sig": "string"
    }
  ],
  "invitedBy": {
    "code": "string",
    "available": 0,
    "disabled": true,
    "forAccount": "string",
    "createdBy": "string",
    "createdAt": "2024-07-29T15:51:28.071Z",
    "uses": [
      {
        "usedBy": "string",
        "usedAt": "2024-07-29T15:51:28.071Z"
      }
    ]
  },
  "invites": [
    {
      "code": "string",
      "available": 0,
      "disabled": true,
      "forAccount": "string",
      "createdBy": "string",
      "createdAt": "2024-07-29T15:51:28.071Z",
      "uses": [
        {
          "usedBy": "string",
          "usedAt": "2024-07-29T15:51:28.071Z"
        }
      ]
    }
  ],
  "invitesDisabled": true,
  "inviteNote": "string",
  "emailConfirmedAt": "2024-07-29T15:51:28.071Z",
  "deactivatedAt": "2024-07-29T15:51:28.071Z",
  "threatSignatures": [
    {
      "property": "string",
      "value": "string"
    }
  ]
}
```

## Requirements

- Add two functions to `src/moderation`: `checkAccountLabels` and `checkRecordLabels`
- Functions must be exportable and asynchronous
- Use rate limiting via the limits set in `src/limits.ts`
