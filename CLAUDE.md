# Architecture Context

## Style

DDD (tactical patterns) + Hexagonal Architecture (Ports & Adapters), organized as a **modular monolith**. Single bounded context covering three aggregates — `Library`, `Author`, `Book` — sharing one NestJS application. Not separate services, not separate deployables.

## Stack

TypeScript + NestJS 11.

- **Validation**: `class-validator` / `class-transformer` on request DTOs, enforced by a global `ValidationPipe({ whitelist: true, transform: true })` in `main.ts`.
- **Caching**: `@nestjs/cache-manager` (in-memory store for now), injected directly into specific use cases — not a blanket HTTP interceptor.
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
│   │   │   ├── interfaces/        # libraryRepository.interface.ts — ILibraryRepository (port) + LIBRARY_REPOSITORY token
│   │   │   └── useCases/          # createLibrary.useCase.ts, getLibrary.useCase.ts, deleteLibrary.useCase.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/      # inMemoryLibrary.repository.ts (adapter)
│   │   │   └── presentation/
│   │   │       ├── library.controller.ts
│   │   │       └── dto/           # createLibrary.dto.ts (request), libraryResponse.dto.ts (response)
│   │   └── library.module.ts      # NestJS module — the composition root for this aggregate
│   ├── author/                    # same shape as library/
│   └── book/                      # same shape as library/; also imports LibraryModule + AuthorModule
├── middlewares/                   # logger.middleware.ts, httpException.filter.ts
├── utils/                         # generateId.util.ts, cacheKey.util.ts
├── schemas/                       # errorResponse.schema.ts (shared response shapes)
├── tests/                         # representative specs, mirrored per module: tests/library/...
├── app.module.ts                  # wires modules/*, global CacheModule, applies LoggerMiddleware
└── main.ts                        # global ValidationPipe + HttpExceptionFilter, listens via ConfigService
```

`author/` and `book/` replicate `library/`'s internal shape exactly. `Book` additionally holds `libraryId: LibraryId` and `authorId: AuthorId`.

## File naming convention

`<name>.<role>.ts`, camelCase for both `name` and multi-word roles:

| Role | Example |
| --- | --- |
| `entity` | `library.entity.ts` |
| `valueObject` | `libraryId.valueObject.ts` |
| `interface` | `libraryRepository.interface.ts` |
| `useCase` | `createLibrary.useCase.ts` |
| `repository` | `inMemoryLibrary.repository.ts` |
| `controller` | `library.controller.ts` |
| `dto` | `createLibrary.dto.ts` |
| `module` | `library.module.ts` |
| `middleware` | `logger.middleware.ts` |
| `filter` | `httpException.filter.ts` |
| `util` | `generateId.util.ts` |
| `schema` | `errorResponse.schema.ts` |
| `spec` | `library.entity.spec.ts` (Jest convention, not `.test.ts`) |

## Path aliases

`tsconfig.json` defines one alias per top-level `src/` folder: `@modules/*`, `@middlewares/*`, `@utils/*`, `@schemas/*`, `@tests/*`.

- Use the alias for any import that crosses a `../` boundary (a different layer within the same module, a different module, or a shared top-level folder).
- Keep same-folder imports relative (`./dto/createLibrary.dto`, `./library.controller`) — no alias needed for direct siblings.
- Cross-module references (e.g. `Book`'s domain importing `LibraryId`, or `CreateBookUseCase` injecting `ILibraryRepository`) always go through `@modules/<aggregate>/...`, never a relative `../../../`.

**Adding a new alias requires updating three places in lockstep**, or it'll type-check but fail at runtime or in tests: `tsconfig.json` (`compilerOptions.paths`), `webpack.config.js` (via `tsconfig-paths-webpack-plugin`, picks up `tsconfig.json` automatically), and **both** Jest configs' `moduleNameMapper` (`package.json` for unit tests, `test/jest-e2e.json` for e2e — these don't read `tsconfig.json` paths on their own).

## Dependency Injection

NestJS-native DI — no hand-written composition root file. Each aggregate's `<name>.module.ts` *is* the composition root for that aggregate:

- Ports (`I<Aggregate>Repository`) are plain TypeScript interfaces.
- Each port's file also exports a `Symbol` injection token (`<AGGREGATE>_REPOSITORY`), e.g. `libraryRepository.interface.ts` exports both `ILibraryRepository` and `LIBRARY_REPOSITORY`.
- The module's `providers` array binds the token to a concrete adapter: `{ provide: LIBRARY_REPOSITORY, useClass: InMemoryLibraryRepository }`.
- A module `exports` its repository token so other modules can inject it directly for cross-aggregate checks (e.g. `BookModule` imports `LibraryModule` and `AuthorModule` to satisfy `CreateBookUseCase`'s dependencies).
- Use cases and repositories are `@Injectable()`; domain entities and Value Objects are plain classes — never decorated, never DI'd, always constructed directly (`Library.create(...)`, `LibraryId.from(...)`).

## Non-negotiable rules

1. Aggregates reference other aggregates by ID only (e.g. `Book.libraryId: LibraryId`), never by direct object reference. Cross-aggregate existence checks happen in the use case, injecting the other aggregate's repository directly — same bounded context, no anti-corruption layer needed.
2. Value Objects are immutable: no setters, only `get()` and static factories (`create()` for a new instance, `from()` to wrap an existing value, `reconstitute()` on the entity to rehydrate from storage without minting a new id).
3. Aggregate Roots enforce their own invariants through methods (e.g. `Address.isValid()`, checked inside `Address.create()`). No public setters that bypass business rules.
4. Repository ports live in `application/interfaces/`, one per aggregate, named `I<Aggregate>Repository`, exporting its `<AGGREGATE>_REPOSITORY` Symbol token from the same file. Keep each interface unsplit (single interface, all methods) unless a real adapter genuinely can't implement one of them.
5. Use cases are single-purpose: one class per operation (`Create...UseCase`, `Get...UseCase`, `Delete...UseCase`, `Get...By...UseCase`), each with one `execute()` method. No generic catch-all services.
6. "Get single entity" use cases look up by ID (`find`), not by name/title.
7. Controllers accept and return DTOs (`infrastructure/presentation/dto/`), never the domain aggregate directly. Mapping happens only at the controller boundary (`ResponseDto.fromDomain(entity)`).
8. Every repository port gets one adapter per active persistence technology, bound via the module's `providers` array — never chosen inside a use case. **Current phase**: a single `InMemory<Aggregate>Repository` per aggregate stands in for real persistence. **Next phase**: `Postgres<Aggregate>Repository` and `Mongo<Aggregate>Repository`, with the active one selected via config in the module (not hand-rolled naming for adapters that don't do what their name says).
9. Only wrap a dependency in an interface/DI token when it crosses an I/O boundary or needs a test double (repositories, external gateways, cache). Pure deterministic domain logic stays a plain class or function, injected/called directly, no interface — this includes id generation (`utils/generateId.util.ts`, a plain `crypto.randomUUID()` wrapper called inside each id Value Object's static `create()`), which stays synchronous and undecorated per the UML class diagrams.
10. Dependency direction: `infrastructure` → `application` → `domain`. `domain` never imports from the other two, and never imports a framework package (no `@nestjs/*` in `domain/`).
11. Use cases signal failure by throwing Nest's built-in HTTP exceptions directly (`NotFoundException`, etc.) — no parallel domain-exception hierarchy. The global `HttpExceptionFilter` (`middlewares/httpException.filter.ts`) normalizes every thrown error, HTTP or not, into the shared `ErrorResponseSchema` shape (`schemas/errorResponse.schema.ts`).
12. Request DTOs are validated with `class-validator` decorators; id path params use `ParseUUIDPipe`. IDs are UUID v4 strings end to end.
13. Caching lives in the specific `Get...UseCase`s where it earns its keep (single-entity lookups by id), through Nest's `CACHE_MANAGER`, with the matching `Delete...UseCase` evicting the same key. List queries (`GetBookByAuthor`, `GetBookByLibrary`) and blanket HTTP-level caching are deliberately not used.

## Testing

- Representative unit specs live under `src/tests/<module>/`, mirroring the module they cover (e.g. `tests/library/library.entity.spec.ts`), imported via the `@modules` alias rather than deep relative paths.
- e2e specs live in `test/*.e2e-spec.ts`, boot the real `AppModule` via `Test.createTestingModule`, and apply the same global `ValidationPipe` main.ts uses.
- Run `npm test` (unit) and `npm run test:e2e` before considering a change done, alongside `npm run build` and `npm run lint`.

## Focus

Consistency over cleverness — replicate the `library/` module's pattern exactly for every new aggregate. Diagrams (UML class + package + ER) are the source of truth for exact class names, attributes, methods, and associations; this file defines conventions, folder shape, and the rules for everything the diagrams don't pin down (DI wiring, caching, error handling, validation, path aliases, file naming).
