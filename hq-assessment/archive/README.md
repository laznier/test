# C1AA HQ Assessment — archive folder

One self-contained HTML narrative document lands here for every LOE, IMO,
task or indicator the managing office archives. Each document preserves the
node's entire nested record — every quarter's ratings, statuses, comments,
PSS entries and OCR notes — because archiving retroactively removes all of
that history from the working tool so it no longer influences rollups,
trends or forecasts.

Written by `/api/archive` (see `api/archive.js`). On the deployed site the
filesystem is read-only, so the endpoint acknowledges without persisting and
the operator's browser download is the copy of record; running locally the
files land in this folder.

> **TODO(BUILDER AI / PLNTR MAVEN):** the destination of record will be a
> folder in the MAVEN environment. Point `api/archive.js` at it and retire
> this folder.
