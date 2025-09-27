Currently, accounts get labeled multiple times because the autolabeler can't detect if there are any labels which already exist on the repo. This can result in accounts being added to lists multiple times, which makes removing them difficult, and for users using listifications.app, can feel like harrasment.

Solution: Use a database to store labels for a given did / at-uri and check against it before adding a label. PostgreSQL is our best bet.

We will also need to implement a mechanism to handle label updates and deletions. This will require tracking changes coming from the ozone instance itself. We can use this using `https://ozone.skywatch.blue/xrpc/com.atproto.label.subscribeLabels`

`com.atproto.label.subscribeLabels: an event stream (WebSocket) endpoint, which broadcasts new labels. Implements the seq backfill mechanism, similar to repository event stream, but with some small differences: the “backfill” period may extend to cursor=0 (meaning that the full history of labels is available via the stream). Labels which have been redacted have the original label removed from the stream, but the negation remains.`

The lexicon is here: https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/label/subscribeLabels.json

This will require decoding the stream from DAG-CBOR. We can use @atcute `https://github.com/mary-ext/atcute?tab=readme-ov-file` to decode the stream. We don't need to worry about the backfill mechanism.
