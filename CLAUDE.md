# janux-persist.js

## Overview

A persistence/DAO abstraction layer with adapter architecture supporting both
MongoDB (Mongoose) and LokiJS (in-memory). Used by easytitle24, glarus, and
janux-portal — moved here from glarus/ since it is a shared dependency.
Provides abstract base classes for CRUD operations, entity validation, and
email integration.

## Tech Stack

- **Language**: TypeScript 4.9.5 → compiled to `dist/` (target ES5)
- **Build**: `tsc` + `tsc-alias` via npm scripts (Gulp removed)
- **Test**: Mocha 3.4.2 + Chai 4.0.2
- **Node**: not specified in `engines`; consumers run it on Node 10 (e24)
  and Node 12 (glarus)
- **Database**: Mongoose 4.10.5 + LokiJS 1.5.0

## Key Dependencies

- mongoose 4.10.5, mongodb 2.2.27, lokijs 1.5.0
- bluebird 3.5.0
- nodemailer 4.6.8 + mail-time 0.1.7 (email integration)
- pug 2.0.3 (email templates)
- md5 2.2.1, randomstring 1.1.5

## `mongodb` must stay pinned to exactly mongoose's own version

`mongoose@4.10.5` hard-pins its own `mongodb` dependency to exactly
`2.2.27` (not a range). This package's `mongodb` dependency (used only by
`BigDecimalUtil.toBigDecimal128()`/`fromBigDecimal128()` for `Decimal128`)
must be pinned to that exact same version, or npm installs two separate,
non-deduped copies of `mongodb`/`bson` — and `Decimal128` becomes two
different classes at runtime. Consumers who validate `Decimal128` fields
through Mongoose (glarus-services does, for money/rate fields) then get
"Cast to Decimal128 failed" on perfectly valid data, because mongoose's
`instanceof` check runs against *its* copy of the class while the value
was constructed against *this package's* copy.

This was introduced (not present before) in the commit that first added
`mongodb` as an explicit dependency here, pinned to `2.2.36` — one patch
version off mongoose's `2.2.27`, just enough to break the shared-instance
hoisting npm was doing implicitly before. Fixed in `0.0.4`. If mongoose's
own pin ever changes, this one needs to move with it.

## janux-people / janux-authorize: real registry deps, not vendor/

`package.json` declares `janux-people` and `janux-authorize` as real
registry versions (`1.0.0` each), not `file:vendor/...`. They were `file:`
paths through 0.0.2, which **broke every consumer's `npm install`**: `npm
publish` ships whatever `files` lists (`dist`, `src`), `vendor/` was never
part of that, so `file:vendor/janux-people.js` doesn't resolve outside this
repo's own checkout. 0.0.1 apparently published fine only because whoever
ran `npm publish` in 2021 hand-edited `package.json` to real semver first,
without ever committing that edit. See the 0.0.3 commit for the full story
and how it was reproduced (a genuinely clean install + `npm pack` into a
throwaway project).

For local cross-repo development against unpublished changes to
janux-people or janux-authorize, use `npm link` — both are already globally
linked in this environment (Node 10.24.1 and 12.22.11), same pattern
glarus-ops already uses for janux-persist itself.

The `vendor/` directory and its symlinks still exist and are harmless to
leave in place, but they are no longer what `npm install` uses.

## Architecture

- `MongooseAdapter` — MongoDB persistence
- `LokiJsAdapter` — in-memory persistence (for tests)
- Abstract DAO base classes with CRUD operations
- Entity validation framework
- User generation utilities

## Build & Test

```bash
npm install
npm run build    # tsc, then tsc-alias to rewrite path aliases
npm run watch    # recompile on change
npm test         # build, then mocha
                 # tests use mongodb://localhost/janux-persistence-test
                 # and ./janux-persistence-test.db (LokiJS)
```

`tsc-alias` is required: `tsconfig.json` sets `baseUrl: ./src` with `paths`
aliases (`daos/*`, `services/*`, `utils/*`, …). `tsc` leaves those aliases
verbatim in the emitted JavaScript, so `tsc-alias` rewrites them to relative
paths afterwards. This is what the old `gulp/convert/*` tasks did.

## `src/example` is not optional

Despite the name, `src/example` is part of the public API and one of its
classes is load-bearing:

- `src/index.ts` re-exports **15 modules** from `src/example` (SampleUser,
  BigDecimal, Ticker and their DAOs) as reference implementations.
- `src/daos/party/party-dao.ts` — production code — imports `StaffImplTest`
  from `example/people-extends/`. `PartyValidator.STAFF` is the literal
  string `"StaffImplTest"`, and the party DAO deserializes stored documents
  by matching `typeName` against it, alongside `PersonImpl` and
  `OrganizationImpl`. Any party document persisted with that `typeName`
  depends on this class.

`tsconfig.json` used to list `src/example` under `exclude`, which never had
any effect — `exclude` only filters the initial file glob, and these files
are pulled back in through the import graph. The entry has been removed to
stop it implying the directory is skippable.

## Known issue: TS2611 on `StaffImplTest.typeName`

`StaffImplTest.typeName` is declared as a class field rather than a getter.
It was a getter, matching `PersonImpl`'s actual runtime shape, but janux-people
is compiled with TypeScript 3.1.8, whose declaration emit flattens
`get typeName(): string` into `readonly typeName: string`. TypeScript 4.9
then refuses the accessor override with error TS2611. The field is
behaviourally equivalent for a constant string; it can be reverted once
janux-people is built with a matching compiler.

## Notes

- Used by: easytitle24-2.x (server), glarus-services, glarus-ops, janux-mail,
  janux-portal
- Git branch: `dev`, remote: github.com/janux/janux-persist.js
- Every published version has a matching annotated tag (`v0.0.2`, `v0.0.3`,
  `v0.0.4`) on the commit that was actually published — see `janux/CLAUDE.md`,
  "Tag every published commit".
- Unmerged `origin/jl-1808-updateNode12` branch from 2021 (2 commits),
  relevant to the Node 12 baseline work.
- `CommService` (`src/services/comm/comm-service.ts`) is the shared outbound
  mail path for easytitle24, glarus-ops and janux-mail. It is slated for
  removal — see `plan/2026-08-26.janux-mail-plan.md` in the workspace root.
