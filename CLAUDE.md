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
- **Node**: `>= 12.0.0` (declared in `engines`, which also covers 24).
  Both consumers run Node 12 today — e24 moved off Node 10 (`E24-16`,
  pinned to `12.22.1` via `.nvmrc`); glarus was already `>= 12.0.0`.
  Verified: the full suite (479 passing) builds and runs clean under both
  Node 12.22 and Node 24.22 — mongoose 4.10.5/mongodb 2.2.27 were already
  fine on 12, only the declared floor and local dev docs were stale at 10.
- **Database**: Mongoose 4.10.5 + LokiJS 1.5.0

## Key Dependencies

- mongoose 4.10.5, mongodb 2.2.27, lokijs 1.5.0
- bluebird 3.5.0
- nodemailer 4.6.8 + mail-time 0.1.7 (email integration)
- pug 2.0.3 (email templates)
- md5 2.2.1, randomstring 1.1.5

## `config` (node-config) is a peerDependency, not a dependency

The consuming app owns `config`: this package declares it under
`peerDependencies` (`>=3.3.12`) and pins 3.3.12 as a `devDependency` for
its own tests. It must not go back under `dependencies`: that gives every
consumer a private nested copy at `node_modules/janux-persist/node_modules/config`,
which can resolve different values than the app's own copy, and the old
1.26.1 copy crashes at load on Node 23+ (`Utils.isRegExp is not a function`;
JAM-136).

The library still calls `require("config")` itself, for three keys the
consuming app defines: `januxPersist.logCategoryPrefix` (optional, read once
when `logger-api` loads), `serverAppContext.db.poolSize` (`DataSource`;
required, `config.get` throws if `serverAppContext` is missing) and
`serverAppContext.system.environment` (`EnvironmentService`; defaults to
`"development"`). Having callers pass these in instead is deliberately not
done in this line; see the library-never-reads-config rule in
`SOFTWARE_DESIGN.md`.

Two things to know when running the tests: config 3.x hands out immutable
objects, so `test/root-hooks.spec.js` gives log4js a `config.util.cloneDeep`
copy of its settings (log4js's file appender writes to the object it is
given); and the test-time `log4js` is 6.9.1, because 2.3.3 calls
`util.isError`, which Node 23 removed.

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
npm run coverage # build, then mocha under nyc — see .nycrc.json
```

## `.nycrc.json` excludes some files despite them having real, passing tests

`src/utils/logger-api/**` and `src/utils/big-decimal/big-decimal-util.ts`
are excluded from the coverage report even though they have real specs
(`test/util/logger-api.spec.js`, `fake-logger.spec.js`,
`big-decimal-util.spec.js`) that pass and genuinely exercise the code —
confirmed via raw `.nyc_output/*.json`, which shows real, non-zero
statement hits recorded for each. This is not a real coverage gap, it's
an nyc/istanbul bug: `all:true` writes a second, synthetic zero-coverage
entry (`hash: undefined`) for every file alongside the real one; for most
files nyc's merge correctly keeps the real data, but for these files
specifically the report ends up showing the zero (or a partially-zeroed,
internally-inconsistent) result instead. Deterministic and reproducible,
not caused by test technique — reproduces even with a trivial,
cache-trick-free test (`big-decimal-util.ts` uses no cache tricks at
all), and isn't affected by nyc's own instrumentation-cache setting.
No consistent trigger identified (file touched by multiple spec files
was one candidate theory, ruled out — `date-util.ts` is touched by
several spec files too and reports correctly).

Excluded from the coverage report rather than left showing a misleading
number — don't re-investigate this as a real coverage gap, and don't
remove the tests, they're correct. If another file trips the same bug
(report shows 0%, or an internally-inconsistent mix like 100% lines
alongside a nonzero "uncovered lines" list, despite `npm test`/`npm run
coverage` showing it passing), the fix is the same: add it to `.nycrc
.json`'s `exclude`, verify via `.nyc_output/*.json` that a real,
properly-hashed entry with nonzero hits exists for it, and note it here.

`getLogger()`'s fallback branch specifically was forced via a
`Module.prototype.require` interception — `Module._resolveFilename` is
unreliable for this once `log4js` has already been required elsewhere in
the process, due to Node's internal `relativeResolveCache` fast-path.

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

## Fixed: `StaffImplTest.typeName` must stay a getter, not a field

`StaffImplTest.typeName` was changed from a getter to a plain class field to
dodge a TypeScript 4.9 compile error (TS2611): janux-people is compiled with
TypeScript 3.1.8, whose declaration emit flattens `get typeName(): string`
into `readonly typeName: string`, and TS 4.9 refuses to let a subclass
override that "property" with an accessor.

That fix was **not** behaviourally equivalent, and broke real runtime
behavior: `PersonImpl.prototype.typeName` is a getter-only accessor with no
setter. A subclass field initializer compiles to `this.typeName = "..."` in
the constructor, and assigning to a property whose only accessor up the
prototype chain is a getter throws in strict mode
(`TypeError: Cannot set property typeName of [object Object] which has only
a getter`) — it does not silently create an own property. Every
`new StaffImplTest(...)` call threw, which surfaced as two permanently
timing-out tests (`staff-example-dao-update.spec.js`'s `beforeEach`, both
db engines — its unhandled promise rejection had no `.catch()`, so `done()`
was never called).

Reverted to a getter (which correctly overrides the parent's getter at the
prototype level, unlike a field) with a `// @ts-ignore` on the TS2611 line,
since the diagnostic itself is a real false positive caused by the
cross-package compiler-version skew, not a real type error. Verified: full
suite is back to 404 passing, 0 failing (0.0.4 shipped with the broken
field version — this is fixed in 0.0.5). Revisit once janux-people is
built with a matching TypeScript version, at which point the `@ts-ignore`
can likely come off too.

## Notes

- Used by: easytitle24-2.x (server), glarus-services, glarus-ops, janux-mail,
  janux-portal
- Git branch: `dev`, remote: github.com/janux/janux-persist.js
- Every published version has a matching annotated tag (`v0.0.2`, `v0.0.3`)
  on the commit that was actually published. See `/VERSIONING.md` (workspace
  root) for the tagging and release-candidate workflow. `0.0.4` and `0.0.5`
  were briefly published and tagged, then unpublished and untagged: only
  this workspace publishes/consumes janux-persist, so rather than carrying
  the churn forward as `0.0.6`, those fixes (mongodb pin, StaffImplTest)
  were consolidated back into `0.0.3` as a `0.0.3-rc1` release candidate —
  a live example of why `VERSIONING.md`'s RC workflow exists. The `v0.0.3`
  tag currently still points at the pre-consolidation commit; it'll move
  once `0.0.3-rc1` is finalized.
- Unmerged `origin/jl-1808-updateNode12` branch from 2021 (2 commits),
  relevant to the Node 12 baseline work.
- `CommService` (`src/services/comm/comm-service.ts`) is the shared outbound
  mail path for easytitle24, glarus-ops and janux-mail. It is slated for
  removal — see `plan/2026-08-26.janux-mail-plan.md` in the workspace root.
- Every log4js category registered through `getLogger()`
  (`src/utils/logger-api/logger-api.ts`) is prefixed `jnx-persist:`, per
  `CODE_CONVENTIONS.md`'s logging section, so a consuming app's combined log
  stream can tell this package's lines apart from its own. A consuming app
  can override the prefix by defining `januxPersist.logCategoryPrefix` in
  its own config (e.g. `""` to turn it off); this package's own
  `config/default.js` is never read in that context, only the host app's.
- **Never log a data source path as it is.** A MongoDB path is a connection
  string, credentials included. Every log statement that mentions one
  (`DataSource`, `DataSourceHandler`, `DaoFactory`, `CommService`) passes it
  through `redactConnectionUrl()` (`src/utils/redact/redact-connection-url.ts`),
  which drops the `user:password@` segment and leaves LokiJS file paths alone
  (JAM-152). `test/services/datasource-handler/no-credentials-in-logs.spec.js`
  exercises each of those code paths with a credentialed URL and fails if any
  captured line, at any level, carries the password. Add a case there when a
  new statement touches a path. It does not cover an application logging its
  own configuration; that is the app's to redact.
