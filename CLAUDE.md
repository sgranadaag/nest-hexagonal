# Architecture Context

## Style

DDD (tactical patterns) + Hexagonal Architecture (Ports & Adapters), organized as a **modular monolith**. Single bounded context covering three aggregates — `Library`, `Author`, `Book` — sharing one NestJS application. Not separate services, not separate deployables.

Both ports and adapters are split by **direction** before anything else: `in/` (inbound/driving — the outside world calling into the app, e.g. HTTP) vs `out/` (outbound/driven — the app calling out to infrastructure, e.g. a database). Technology/protocol is a second-level split underneath that (`out/postgres/`, `out/inMemory/`, `in/rest/`).

## Stack

TypeScript + NestJS 11.

- **Validation**: `class-validator` / `class-transformer` on request DTOs, enforced by a global `ValidationPipe({ whitelist: true, transform: true })` in `main.ts`.
- **Caching**: `@nestjs/cache-manager` (in-memory store for now), injected directly into specific use cases — not a blanket HTTP interceptor.
- **Persistence**: Postgres via `@nestjs/typeorm` + `typeorm`, wired in `app.module.ts` through `TypeOrmModule.forRootAsync`. Local Postgres runs via `docker-compose.yml` (single `postgres` service, credentials sourced from `.env`). `Postgres<Aggregate>Repository` is the active binding for the `<AGGREGATE>_REPOSITORY` token in every module; `InMemory<Aggregate>Repository` stays registered as a plain provider (DI-constructible, e.g. for tests) but nothing binds it — see rule 8. `synchronize: false` — schema is owned by hand-written migrations in `migrations/postgres/`, not auto-sync; see Migrations below.
- **Build**: Nest CLI with the **webpack** builder (`nest-cli.json` → `"webpack": true`, `webpackConfigPath: "webpack.config.js"`), required so TypeScript path aliases actually resolve at runtime (the default `tsc` builder does not rewrite them).

## Folder structure

```
src/
├── modules/
│   ├── library/
│   │   ├── domain/
│   │   │   ├── entities/          # library.entity.ts (Aggregate Root)
│   │   │   └── valueObjects/      # libraryId.valueObject.ts, address.valueObject.ts
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   ├── in/         # createLibrary.port.ts, getLibrary.port.ts, deleteLibrary.port.ts — one inbound port per use case
│   │   │   │   └── out/        # libraryRepository.port.ts — ILibraryRepository (port) + LIBRARY_REPOSITORY token
│   │   │   └── useCases/       # createLibrary.useCase.ts, getLibrary.useCase.ts, deleteLibrary.useCase.ts — implement the matching ports/in interface
│   │   ├── infrastructure/
│   │   │   └── adapters/
│   │   │       ├── in/
│   │   │       │   └── rest/   # library.controller.ts, dto/ (createLibrary.dto.ts request, libraryResponse.dto.ts response)
│   │   │       └── out/
│   │   │           ├── inMemory/   # inMemoryLibrary.repository.ts
│   │   │           └── postgres/   # postgresLibrary.entity.ts (ORM), postgresLibrary.mapper.ts, postgresLibrary.repository.ts
│   │   └── library.module.ts      # NestJS module — the composition root for this aggregate
│   ├── author/                    # same shape as library/
│   └── book/                      # same shape as library/; also imports LibraryModule + AuthorModule
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

`author/` and `book/` replicate `library/`'s internal shape exactly. `Book` additionally holds `libraryId: LibraryId` and `authorId: AuthorId`. `health/` is the one exception: no domain/ports/persistence at all, just `application/useCases/getHealth.useCase.ts` and `infrastructure/adapters/in/rest/` (no `out/` — nothing for it to call out to).

## File naming convention

`<name>.<role>.ts`, camelCase for both `name` and multi-word roles:

| Role | Example |
| --- | --- |
| `entity` | `library.entity.ts` |
| `valueObject` | `libraryId.valueObject.ts` |
| `port` | `libraryRepository.port.ts` (out), `createLibrary.port.ts` (in) |
| `useCase` | `createLibrary.useCase.ts` |
| `repository` | `inMemoryLibrary.repository.ts` |
| `mapper` | `postgresLibrary.mapper.ts` |
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

Folder location and file-suffix role are independent: port files use the `.port.ts` suffix regardless of direction, split by folder into `application/ports/out/` vs `application/ports/in/`; repository adapter files keep the `.repository.ts` suffix but live in `infrastructure/adapters/out/<technology>/`; controller/DTO files keep their usual suffixes but live in `infrastructure/adapters/in/rest/`. ORM entity files reuse the `.entity.ts` suffix (like the domain Aggregate Root) but are always technology-prefixed (`postgresLibrary.entity.ts`) and live under `infrastructure/adapters/out/postgres/`, never under `domain/entities/` — the prefix and the folder both disambiguate them from the real domain entity.

## Path aliases

`tsconfig.json` defines one alias per top-level `src/` folder: `@modules/*`, `@middlewares/*`, `@utils/*`, `@schemas/*`, `@tests/*`, `@config/*`, `@constants/*`.

- Use the alias for any import that crosses a `../` boundary (a different layer within the same module, a different module, or a shared top-level folder).
- Keep same-folder imports relative (`./dto/createLibrary.dto`, `./library.controller`) — no alias needed for direct siblings.
- Cross-module references (e.g. `Book`'s domain importing `LibraryId`, or `CreateBookUseCase` injecting `ILibraryRepository`) always go through `@modules/<aggregate>/...`, never a relative `../../../`.

**Adding a new alias requires updating three places in lockstep**, or it'll type-check but fail at runtime or in tests: `tsconfig.json` (`compilerOptions.paths`), `webpack.config.js` (via `tsconfig-paths-webpack-plugin`, picks up `tsconfig.json` automatically), and **both** Jest configs' `moduleNameMapper` (`package.json` for unit tests, `test/jest-e2e.json` for e2e — these don't read `tsconfig.json` paths on their own).

## Dependency Injection

NestJS-native DI — no hand-written composition root file. Each aggregate's `<name>.module.ts` *is* the composition root for that aggregate. The same token+interface pattern applies on both sides of the hexagon, just with the dependency pointing the opposite way:

- **Outbound** (`ports/out/`): `I<Aggregate>Repository` is a plain TypeScript interface; its file also exports a `Symbol` token (`<AGGREGATE>_REPOSITORY`), e.g. `libraryRepository.port.ts` exports both `ILibraryRepository` and `LIBRARY_REPOSITORY`. The module's `providers` array binds the token to a concrete **adapter**: `{ provide: LIBRARY_REPOSITORY, useClass: InMemoryLibraryRepository }`. The *use case* injects the token/interface — it depends inward on its own port, an adapter depends outward to implement it.
- **Inbound** (`ports/in/`): one port per use case, e.g. `createLibrary.port.ts` exports `ICreateLibraryUseCase` and the token `CREATE_LIBRARY_USE_CASE`. The module's `providers` array binds the token to the concrete **use case**: `{ provide: CREATE_LIBRARY_USE_CASE, useClass: CreateLibraryUseCase }`. The *controller* (the driving adapter) injects the token/interface instead of the concrete use case class — same shape as the outbound side, mirrored.
- A module `exports` its repository token so other modules can inject it directly for cross-aggregate checks (e.g. `BookModule` imports `LibraryModule` and `AuthorModule` to satisfy `CreateBookUseCase`'s dependencies). Inbound use-case tokens are never exported — nothing outside a module's own controller ever needs to call another aggregate's use case.
- Use cases and repositories are `@Injectable()`; domain entities and Value Objects are plain classes — never decorated, never DI'd, always constructed directly (`Library.create(...)`, `LibraryId.from(...)`).

## Non-negotiable rules

1. Aggregates reference other aggregates by ID only (e.g. `Book.libraryId: LibraryId`), never by direct object reference. Cross-aggregate existence checks happen in the use case, injecting the other aggregate's repository directly — same bounded context, no anti-corruption layer needed.
2. Value Objects are immutable: no setters, only `get()` and static factories (`create()` for a new instance, `from()` to wrap an existing value, `reconstitute()` on the entity to rehydrate from storage without minting a new id).
3. Aggregate Roots enforce their own invariants through methods (e.g. `Address.isValid()`, checked inside `Address.create()`). No public setters that bypass business rules.
4. Repository ports live in `application/ports/out/`, one per aggregate, named `I<Aggregate>Repository`, exporting its `<AGGREGATE>_REPOSITORY` Symbol token from the same file. Keep each interface unsplit (single interface, all methods) unless a real adapter genuinely can't implement one of them.
5. Use cases are single-purpose: one class per operation (`Create...UseCase`, `Get...UseCase`, `Delete...UseCase`, `Get...By...UseCase`), each with one `execute()` method. No generic catch-all services. Each use case has a matching inbound port in `application/ports/in/<useCase>.port.ts`, named `I<UseCase>UseCase` (single `execute()` method, same signature as the class) and exporting a `<USE_CASE>_USE_CASE` Symbol token — one port per use case, never one bundled port per aggregate, since that would contradict the single-purpose rule this exists to mirror. The use case class `implements` its port; the module binds the token to the class (`{ provide: CREATE_LIBRARY_USE_CASE, useClass: CreateLibraryUseCase }`) instead of registering the class bare; the controller injects the token/interface, never the concrete class.
6. "Get single entity" use cases look up by ID (`find`), not by name/title.
7. Controllers accept and return DTOs (`infrastructure/adapters/in/rest/dto/`), never the domain aggregate directly. Mapping happens only at the controller boundary (`ResponseDto.fromDomain(entity)`). The controller itself is the inbound/driving REST adapter — it lives alongside its DTOs in `infrastructure/adapters/in/rest/`, not in a separate `presentation/` folder.
8. Every repository port gets one adapter per persistence technology, each living in its own `infrastructure/adapters/out/<technology>/` subfolder (`inMemory/`, `postgres/`, later `mongo/`) — never mixed in a flat `adapters/` folder. Only the adapter bound to the `<AGGREGATE>_REPOSITORY` token via the module's `providers` array is active; the others may still be registered as plain providers (so they're DI-constructible and gettable in tests) without being wired to the token. **Current phase**: `Postgres<Aggregate>Repository` is the active binding for every aggregate; `InMemory<Aggregate>Repository` is still implemented and registered (plain provider, e.g. for tests) but not bound to any token. **Next phase**: add `Mongo<Aggregate>Repository` alongside it, with the active one selected via config in the module rather than hand-edited per binding — not hand-rolled naming for adapters that don't do what their name says. A database-backed adapter's folder holds three files: `<technology><Aggregate>.entity.ts` (the TypeORM/ODM row shape), `<technology><Aggregate>.mapper.ts` (static `toDomain`/`toPersistence` methods converting between that row shape and the domain Aggregate Root), and `<technology><Aggregate>.repository.ts` (implements the port, injects the underlying driver's repository/client, delegates all domain↔row conversion to the mapper). Cross-aggregate foreign keys (e.g. `Book`'s `authorId`/`libraryId`) get a real DB-level constraint via a `@ManyToOne` relation property on the owning entity (e.g. `PostgresBookEntity.author: PostgresAuthorEntity`), co-located with the plain `@Column() authorId: string` it shares a join column with (TypeORM merges the two under its default naming strategy — no `@JoinColumn` needed as long as the column property is named `<relationProperty>Id`). Each `@ManyToOne` also declares its inverse `@OneToMany` on the referenced entity (e.g. `PostgresLibraryEntity.books: PostgresBookEntity[]`, `PostgresAuthorEntity.books: PostgresBookEntity[]`) for query convenience — this makes the postgres-entity files circularly import each other (`postgresBook.entity.ts` ↔ `postgresLibrary.entity.ts`/`postgresAuthor.entity.ts`), which is safe here only because TypeORM relation decorators take a lazy `() => Entity` thunk instead of the class directly, deferring resolution past module-evaluation time. This is a schema/query-convenience concern only: the mapper and repository still only ever read/write the raw id column, **never** the `author`/`library`/`books` navigation properties — no `relations: [...]` option is ever passed when querying. Fetching "all books for a library/author" from application code still goes through `IBookRepository.findByLibrary`/`findByAuthor` (the `Book` aggregate's own port), not through `library.books`/`author.books` — that keeps rule 1's "reference by ID only" intact at the domain/application layer even though Postgres enforces referential integrity, and both relation directions exist, underneath.
9. Only wrap a dependency in an interface/DI token when it crosses an I/O boundary or needs a test double (repositories, external gateways, cache). Pure deterministic domain logic stays a plain class or function, injected/called directly, no interface — this includes id generation (`utils/generateId.util.ts`, a plain `crypto.randomUUID()` wrapper called inside each id Value Object's static `create()`), which stays synchronous and undecorated per the UML class diagrams.
10. Dependency direction: `infrastructure` → `application` → `domain`. `domain` never imports from the other two, and never imports a framework package (no `@nestjs/*` in `domain/`).
11. Use cases signal failure by throwing Nest's built-in HTTP exceptions directly (`NotFoundException`, etc.) — no parallel domain-exception hierarchy. The global `HttpExceptionFilter` (`middlewares/httpException.filter.ts`) normalizes every thrown error, HTTP or not, into the shared `ErrorResponseSchema` shape (`schemas/errorResponse.schema.ts`).
12. Request DTOs are validated with `class-validator` decorators; id path params use `ParseUUIDPipe`. IDs are UUID v4 strings end to end.
13. Caching lives in the specific `Get...UseCase`s where it earns its keep (single-entity lookups by id), through Nest's `CACHE_MANAGER`, with the matching `Delete...UseCase` evicting the same key. List queries (`GetBookByAuthor`, `GetBookByLibrary`) and blanket HTTP-level caching are deliberately not used.
14. Environment variable keys are defined once as constants in `constants/` (e.g. `ENV.DATABASE_HOST` in `environment.constant.ts`) — never a raw string literal passed to `ConfigService.get()`. Each persistence technology's connection setup is a plain factory function in `config/` (e.g. `postgres.config.ts`'s `postgresConfig(configService)`), reading only from those `ENV` constants and returning the driver's module options; `app.module.ts` wires it in via `useFactory`, never inlining the connection object itself.

## Testing

- Unit tests live under `src/tests/<module>/<name>.<role>.test.ts`, one folder per aggregate (`tests/library/`, `tests/author/`, `tests/book/`), imported via the `@modules` alias rather than deep relative paths. Jest's `testRegex` matches `.test.ts` — not `.spec.ts`.
- **Scope: business logic only** — `domain` (entities, Value Objects) and `application` (use cases). Infrastructure (controllers, DTOs, repository adapters) and cross-cutting middleware/utils are exercised through the e2e suite instead, not unit-tested directly — they're thin/framework glue, not business rules.
- Use case tests mock the repository port(s) (and `Cache` where injected) with plain object literals of named `jest.fn()`s — not `jest.Mocked<Interface>` directly, since asserting on a bare method reference off an interface-typed object trips `@typescript-eslint/unbound-method`. `Cache`'s methods are property-typed (arrow-style), so this doesn't apply to cache mocks.
- Cross-aggregate rules (e.g. `CreateBookUseCase` rule 1) are tested by asserting the `NotFoundException` path when the injected `ILibraryRepository`/`IAuthorRepository` mock returns `null`, not by spinning up real repositories.
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
