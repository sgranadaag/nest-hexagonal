# Architecture Context

## Style

DDD (tactical patterns) + Hexagonal Architecture (Ports & Adapters), organized as a **modular monolith**. Single bounded context covering three aggregates — `Library`, `Author`, `Book` — sharing one NestJS application. Not separate services, not separate deployables.

Each module has three layers: `domain/` (the Aggregate Root + its Value Objects), `application/` (one `<name>.service.ts` holding all of the aggregate's business logic, plus `ports/` for the interfaces it needs from the outside world), and `infrastructure/` (the REST controller + its DTOs, and `adapters/` for the classes that implement a port). Only outbound (driven) ports exist — the controller calls the service directly, with no inbound port in between.

## Stack

TypeScript + NestJS 11.

- **Validation**: `class-validator` / `class-transformer` on request DTOs, enforced by a global `ValidationPipe({ whitelist: true, transform: true })` in `main.ts`.
- **Caching**: `@nestjs/cache-manager` (in-memory store for now), used only inside `CachedBookDecorator` (`book/infrastructure/adapters/cachedBook.decorator.ts`) — never in `application/`, and not a blanket HTTP interceptor. See rule 13.
- **Persistence**: Postgres via `@nestjs/typeorm` + `typeorm`, wired in `app.module.ts` through `TypeOrmModule.forRootAsync`. Local Postgres runs via `docker-compose.yml` (single `postgres` service, credentials sourced from `.env`). `Postgres<Aggregate>Adapter` is the persistence adapter in every module — bound directly to `<AGGREGATE>_REPOSITORY` for `library`/`author`, wrapped by `CachedBookDecorator` for `book` (rules 8 and 13). `synchronize: false` — schema is owned by hand-written migrations in `migrations/postgres/`, not auto-sync; see Migrations below.
- **Build**: Nest CLI with the **webpack** builder (`nest-cli.json` → `"webpack": true`, `webpackConfigPath: "webpack.config.js"`), required so TypeScript path aliases actually resolve at runtime (the default `tsc` builder does not rewrite them).

## Folder structure

```
src/
├── modules/
│   ├── library/
│   │   ├── domain/
│   │   │   ├── library.entity.ts      # Aggregate Root
│   │   │   └── valueObjects/          # libraryId.valueObject.ts, address.valueObject.ts
│   │   ├── application/
│   │   │   ├── library.service.ts     # LibraryService — create/get/delete, all business logic for the aggregate
│   │   │   └── ports/                 # libraryRepository.port.ts — ILibraryRepository (port) + LIBRARY_REPOSITORY token
│   │   ├── infrastructure/
│   │   │   ├── library.controller.ts  # REST controller, injects LibraryService
│   │   │   ├── dto/                   # createLibrary.dto.ts (request), libraryResponse.dto.ts (response)
│   │   │   └── adapters/              # only classes implementing a port: postgresLibrary.adapter.ts (+ its .entity.ts and .mapper.ts)
│   │   └── library.module.ts          # NestJS module — the composition root for this aggregate
│   ├── author/                    # same shape as library/
│   └── book/                      # same shape as library/; also imports LibraryModule + AuthorModule, plus adapters/cachedBook.decorator.ts
├── middlewares/                   # logger.middleware.ts, httpException.filter.ts
├── utils/                         # generateId.util.ts, cacheKey.util.ts
├── schemas/                       # errorResponse.schema.ts (shared response shapes)
├── config/                        # postgres.config.ts (Nest factory) + typeorm.datasource.ts (CLI DataSource for migrations)
├── constants/                     # environment.constant.ts — ENV var key constants, consumed by config/ and anywhere else reading ConfigService
├── migrations/
│   └── postgres/                  # <timestamp>-<Name>.ts — schema + seed migrations, run via `npm run migration:*`
├── tests/                         # representative specs, mirrored per module: tests/library/...
├── app.module.ts                  # wires modules/*, global CacheModule, TypeOrmModule, applies LoggerMiddleware
└── main.ts                        # global ValidationPipe + HttpExceptionFilter, listens via ConfigService
```

`author/` and `book/` replicate `library/`'s internal shape exactly. `Book` additionally holds `libraryId: LibraryId` and `authorId: AuthorId`. `health/` is the one exception: no ports or persistence, just `domain/health.entity.ts`, `application/health.service.ts` and `infrastructure/health.controller.ts` + `dto/` (no `ports/` or `adapters/` — nothing for it to call out to).

## File naming convention

`<name>.<role>.ts`, camelCase for both `name` and multi-word roles:

| Role | Example |
| --- | --- |
| `entity` | `library.entity.ts` |
| `valueObject` | `libraryId.valueObject.ts` |
| `port` | `libraryRepository.port.ts` |
| `service` | `library.service.ts` |
| `adapter` | `postgresLibrary.adapter.ts` |
| `mapper` | `postgresLibrary.mapper.ts` |
| `decorator` | `cachedBook.decorator.ts` |
| `controller` | `library.controller.ts` |
| `dto` | `createLibrary.dto.ts` |
| `module` | `library.module.ts` |
| `middleware` | `logger.middleware.ts` |
| `filter` | `httpException.filter.ts` |
| `util` | `generateId.util.ts` |
| `schema` | `errorResponse.schema.ts` |
| `config` | `postgres.config.ts` |
| `constant` | `environment.constant.ts` |
| `datasource` | `typeorm.datasource.ts` |
| `test` | `library.entity.test.ts` |

`migrations/postgres/*.ts` is the one deliberate exception to `<name>.<role>.ts`: filenames follow TypeORM's own required `<timestamp>-<PascalCaseName>.ts` shape (enforced by `migration:create` and by ordering during `migration:run`), not the project's camelCase convention.

Adapter files are technology-prefixed and use the `.adapter.ts` suffix (`postgresLibrary.adapter.ts`, class `PostgresLibraryAdapter`), living in `infrastructure/adapters/` alongside their `.entity.ts`/`.mapper.ts`. ORM entity files reuse the `.entity.ts` suffix (like the domain Aggregate Root) but are always technology-prefixed (`postgresLibrary.entity.ts`) and live under `infrastructure/adapters/`, never under `domain/` — the prefix and the folder both disambiguate them from the real domain entity.

## Path aliases

`tsconfig.json` defines one alias per top-level `src/` folder: `@modules/*`, `@middlewares/*`, `@utils/*`, `@schemas/*`, `@tests/*`, `@config/*`, `@constants/*`.

- Use the alias for any import that crosses a `../` boundary (a different layer within the same module, a different module, or a shared top-level folder).
- Keep same-folder imports relative (`./dto/createLibrary.dto`, `./library.controller`) — no alias needed for direct siblings.
- Cross-module references (e.g. `Book`'s domain importing `LibraryId`, or `BookService` injecting `ILibraryRepository`) always go through `@modules/<aggregate>/...`, never a relative `../../../`.

**Adding a new alias requires updating three places in lockstep**, or it'll type-check but fail at runtime or in tests: `tsconfig.json` (`compilerOptions.paths`), `webpack.config.js` (via `tsconfig-paths-webpack-plugin`, picks up `tsconfig.json` automatically), and **both** Jest configs' `moduleNameMapper` (`package.json` for unit tests, `test/jest-e2e.json` for e2e — these don't read `tsconfig.json` paths on their own).

## Dependency Injection

NestJS-native DI — no hand-written composition root file. Each aggregate's `<name>.module.ts` *is* the composition root for that aggregate.

- **Ports** (`application/ports/`): `I<Aggregate>Repository` is a plain TypeScript interface; its file also exports a `Symbol` token (`<AGGREGATE>_REPOSITORY`), e.g. `libraryRepository.port.ts` exports both `ILibraryRepository` and `LIBRARY_REPOSITORY`. The module's `providers` array binds the token to a concrete **adapter**: `{ provide: LIBRARY_REPOSITORY, useClass: PostgresLibraryAdapter }`. The *service* injects the token/interface — it depends inward on its own port, an adapter depends outward to implement it.
- **Services** are registered bare (`providers: [LibraryService, ...]`) and the controller injects the concrete class directly — there's no inbound port/token.
- A module `exports` its repository token so other modules can inject it directly for cross-aggregate checks (e.g. `BookModule` imports `LibraryModule` and `AuthorModule` to satisfy `BookService`'s dependencies). Services are never exported — nothing outside a module's own controller ever calls another aggregate's service.
- Services and adapters are `@Injectable()`; domain entities and Value Objects are plain classes — never decorated, never DI'd, always constructed directly (`Library.create(...)`, `LibraryId.from(...)`).

## Non-negotiable rules

1. Aggregates reference other aggregates by ID only (e.g. `Book.libraryId: LibraryId`), never by direct object reference. Cross-aggregate existence checks happen in the service, injecting the other aggregate's repository directly — same bounded context, no anti-corruption layer needed.
2. Value Objects are immutable: no setters, only `get()` and static factories (`create()` for a new instance, `from()` to wrap an existing value, `reconstitute()` on the entity to rehydrate from storage without minting a new id).
3. Aggregate Roots enforce their own invariants through methods (e.g. `Address.isValid()`, checked inside `Address.create()`). No public setters that bypass business rules.
4. Repository ports live in `application/ports/`, one per aggregate, named `I<Aggregate>Repository`, exporting its `<AGGREGATE>_REPOSITORY` Symbol token from the same file. Keep each interface unsplit (single interface, all methods) unless a real adapter genuinely can't implement one of them.
5. One service per aggregate (`LibraryService`, `AuthorService`, `BookService`) in `application/<name>.service.ts`, holding every operation for that aggregate as a method (`create`, `get`, `delete`, `getBy...`). Services hold the business logic only: orchestrating the aggregate, and its repository port. Never HTTP/DTO concerns, never persistence or caching details.
6. "Get single entity" service methods look up by ID (`find`), not by name/title.
7. Controllers accept and return DTOs (`infrastructure/dto/`), never the domain aggregate directly. Mapping happens only at the controller boundary (`ResponseDto.fromDomain(entity)`). The controller lives directly in `infrastructure/`, not in `adapters/` (that folder is reserved for port implementations) and not in a separate `presentation/` folder.
8. `infrastructure/adapters/` holds only classes that implement a port: one adapter per persistence technology, technology-prefixed (`postgresLibrary.adapter.ts`, later `mongoLibrary.adapter.ts`). The module binds the active one to `<AGGREGATE>_REPOSITORY` directly, unless a decorator wraps it (rule 13). Decorators also implement the port, so they live in `adapters/` too, distinguished only by the `.decorator.ts` suffix. **Current phase**: `Postgres<Aggregate>Adapter` is the persistence adapter for every aggregate. A database-backed adapter comes with three files: `<technology><Aggregate>.entity.ts` (the TypeORM/ODM row shape), `<technology><Aggregate>.mapper.ts` (static `toDomain`/`toPersistence` methods converting between that row shape and the domain Aggregate Root), and `<technology><Aggregate>.adapter.ts` (implements the port, injects the underlying driver's repository/client, delegates all domain↔row conversion to the mapper). Cross-aggregate foreign keys (e.g. `Book`'s `authorId`/`libraryId`) get a real DB-level constraint via a `@ManyToOne` relation property on the owning entity (e.g. `PostgresBookEntity.author: PostgresAuthorEntity`), co-located with the plain `@Column() authorId: string` it shares a join column with (TypeORM merges the two under its default naming strategy — no `@JoinColumn` needed as long as the column property is named `<relationProperty>Id`). Each `@ManyToOne` also declares its inverse `@OneToMany` on the referenced entity (e.g. `PostgresLibraryEntity.books: PostgresBookEntity[]`, `PostgresAuthorEntity.books: PostgresBookEntity[]`) for query convenience — this makes the postgres-entity files circularly import each other (`postgresBook.entity.ts` ↔ `postgresLibrary.entity.ts`/`postgresAuthor.entity.ts`), which is safe here only because TypeORM relation decorators take a lazy `() => Entity` thunk instead of the class directly, deferring resolution past module-evaluation time. This is a schema/query-convenience concern only: the mapper and adapter still only ever read/write the raw id column, **never** the `author`/`library`/`books` navigation properties — no `relations: [...]` option is ever passed when querying. Fetching "all books for a library/author" from application code still goes through `IBookRepository.findByLibrary`/`findByAuthor` (the `Book` aggregate's own port), not through `library.books`/`author.books` — that keeps rule 1's "reference by ID only" intact at the domain/application layer even though Postgres enforces referential integrity, and both relation directions exist, underneath.
9. Only wrap a dependency in an interface/DI token when it crosses an I/O boundary or needs a test double (repositories, external gateways, cache). Pure deterministic domain logic stays a plain class or function, injected/called directly, no interface — this includes id generation (`utils/generateId.util.ts`, a plain `crypto.randomUUID()` wrapper called inside each id Value Object's static `create()`), which stays synchronous and undecorated per the UML class diagrams.
10. Dependency direction: `infrastructure` → `application` → `domain`. `domain` never imports from the other two, and never imports a framework package (no `@nestjs/*` in `domain/`).
11. Services signal failure by throwing Nest's built-in HTTP exceptions directly (`NotFoundException`, etc.) — no parallel domain-exception hierarchy. The global `HttpExceptionFilter` (`middlewares/httpException.filter.ts`) normalizes every thrown error, HTTP or not, into the shared `ErrorResponseSchema` shape (`schemas/errorResponse.schema.ts`).
12. Request DTOs are validated with `class-validator` decorators; id path params use `ParseUUIDPipe`. IDs are UUID v4 strings end to end.
13. Caching is an infrastructure concern, implemented with the GoF **Decorator** pattern, and currently applied **only to `Book`**. `CachedBookDecorator` (`book/infrastructure/adapters/cachedBook.decorator.ts`) implements `IBookRepository` and wraps **another `IBookRepository`** — it depends only on the port, never on a concrete adapter, and never imports another file from `adapters/`. It lives in `adapters/` because it implements the port like any other adapter; the `.decorator.ts` suffix (instead of `.adapter.ts`) marks its different role: an adapter implements the port against a technology, a decorator only wraps whatever implements that port, adding cross-cutting behavior. Decorators are plain classes (no `@Injectable()`/`@Inject()`), so the module is the only place that decides what wraps what, composing the chain with a factory: `{ provide: BOOK_REPOSITORY, inject: [PostgresBookAdapter, CACHE_MANAGER], useFactory: (adapter, cache) => new CachedBookDecorator(adapter, cache) }`, with `PostgresBookAdapter` registered as a plain provider. Swapping the persistence technology or stacking another decorator only touches that factory. Services never know a cache exists. `find(id)` reads through the cache; `save()` and `delete()` evict the same key. The cache stores a primitive snapshot (a plain object of the aggregate's fields), never the domain instance, and rebuilds it with `Book.reconstitute(...)` on a hit, so any serializing store (e.g. Redis) works unchanged. `findByAuthor`/`findByLibrary` pass straight through, uncached. `Library` and `Author` are not cached: their tokens bind straight to the Postgres adapter. Swapping the cache provider means changing the `CacheModule` store in `app.module.ts`; caching another aggregate means adding an `adapters/cached<Aggregate>.decorator.ts` and composing it in that module's factory the same way.
14. Environment variable keys are defined once as constants in `constants/` (e.g. `ENV.DATABASE_HOST` in `environment.constant.ts`) — never a raw string literal passed to `ConfigService.get()`. Each persistence technology's connection setup is a plain factory function in `config/` (e.g. `postgres.config.ts`'s `postgresConfig(configService)`), reading only from those `ENV` constants and returning the driver's module options; `app.module.ts` wires it in via `useFactory`, never inlining the connection object itself.

## Testing

- Unit tests live under `src/tests/<module>/<name>.<role>.test.ts`, one folder per aggregate (`tests/library/`, `tests/author/`, `tests/book/`), imported via the `@modules` alias rather than deep relative paths. Jest's `testRegex` matches `.test.ts` — not `.spec.ts`.
- **Scope: business logic only** — `domain` (entities, Value Objects) and `application` (services). Infrastructure (controllers, DTOs, adapters) and cross-cutting middleware/utils are exercised through the e2e suite instead, not unit-tested directly — they're thin/framework glue, not business rules.
- One test file per service (`library.service.test.ts`), with a nested `describe` per method. Service tests mock the repository port(s) with plain object literals of named `jest.fn()`s — not `jest.Mocked<Interface>` directly, since asserting on a bare method reference off an interface-typed object trips `@typescript-eslint/unbound-method`. Caching lives in infrastructure decorators, so service tests never mock `Cache`.
- Cross-aggregate rules (e.g. `BookService.create`, rule 1) are tested by asserting the `NotFoundException` path when the injected `ILibraryRepository`/`IAuthorRepository` mock returns `null`, not by spinning up real repositories.
- e2e specs live in `test/*.e2e-spec.ts` (`health`, `library`, `author`, `book`), boot the real `AppModule` via `Test.createTestingModule`, and apply the same global `ValidationPipe`/`HttpExceptionFilter` main.ts uses — no mocking, they hit the real Postgres, so each spec creates its own data and cleans up after itself in `afterAll` rather than relying on or mutating the migration's seeded rows.
- Run `npm test` (unit) and `npm run test:e2e` before considering a change done, alongside `npm run build` and `npm run lint`. Both require nothing external for unit tests; e2e requires Postgres reachable (`docker compose up -d`) since `AppModule` boots the real `TypeOrmModule`.
- `postman_collection.json` (repo root) is a manual/exploratory collection covering the same HTTP surface as the e2e specs — not part of `npm test`/`npm run test:e2e`, not CI-enforced. Folder order matters if run top-to-bottom: `Book` creation depends on `Library`/`Author` existing (rule 1 check, now also a real Postgres FK), so their deletes live in a final `Cleanup` folder rather than each aggregate's own folder.

## Migrations

- `src/config/typeorm.datasource.ts` exports `AppDataSource`, a plain `DataSource` instance (not `TypeOrmModuleOptions`) for the TypeORM CLI — it loads env vars itself via `dotenv/config` since the CLI runs outside Nest's bootstrap and never gets a `ConfigService`. It imports `ENV` via a **relative** path (`../constants/environment.constant`), not the `@constants/*` alias — `typeorm-ts-node-commonjs` isn't guaranteed to resolve `tsconfig.json` path aliases, so this one file deliberately opts out of the alias convention rather than risk it breaking silently.
- `npm run migration:run` / `migration:revert` run as `node -r tsconfig-paths/register node_modules/typeorm/cli-ts-node-commonjs.js migration:* -d src/config/typeorm.datasource.ts`, **not** the plain `typeorm-ts-node-commonjs` bin. Reason: `postgresBook.entity.ts`/`postgresAuthor.entity.ts`/`postgresLibrary.entity.ts` import each other via the `@modules/*` alias for their `@ManyToOne`/`@OneToMany` relations (rule 8), and the bin shim can't take a `-r` flag to register `tsconfig-paths` before ts-node compiles them — without it, `migration:run` fails with `Cannot find module '@modules/...'`. `migration:create` doesn't touch any entity file (it only scaffolds an empty `up`/`down` pair, no DB connection), so it's fine as the plain `typeorm-ts-node-commonjs migration:create -- src/migrations/postgres/<PascalCaseName>`.
- Migrations are hand-written SQL via `queryRunner.query(...)`, not `migration:generate`'s entity-diffing — there's no running schema to diff against until the first migration creates it.
- Current migrations (in order): `CreateLibrariesAuthorsBooksTables` (the three tables + the `books.authorId`/`books.libraryId` FKs) and `SeedLibrariesAuthorsBooksTestData` (2 libraries, 2 authors, 3 books, fixed UUIDs so `down()` can delete by id).

## Focus

Consistency over cleverness — replicate the `library/` module's pattern exactly for every new aggregate. Diagrams (UML class + package + ER) are the source of truth for exact class names, attributes, methods, and associations; this file defines conventions, folder shape, and the rules for everything the diagrams don't pin down (DI wiring, caching, error handling, validation, path aliases, file naming).
