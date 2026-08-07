# nest-hexagonal — monolith branch

A [NestJS](https://nestjs.com) service that models a small library domain —
`Library`, `Author`, `Book` — as a **modular monolith** built with **Domain-Driven
Design (tactical patterns) + Hexagonal Architecture (Ports & Adapters)**,
following **Clean Architecture**'s dependency rule throughout.

This branch is one entry in a wider repository that compares the same
architectural discipline across different deployment topologies (see the
`main` branch for the map). Here, the topology is a single deployable
service; everything below explains what that looks like in practice and,
more importantly, *why* it's built this way.

## Why Hexagonal (Ports & Adapters)

The idea behind Hexagonal Architecture is simple to state and easy to get
wrong in practice: **the business logic shouldn't know how it's being
called, or what it's storing data in.** An HTTP request and a message off a
queue should be able to trigger the same use case without that use case
knowing which one happened. A Postgres table and an in-memory `Map` should
be swappable behind a repository without touching a single business rule.

The mechanism for that is **ports and adapters**:

- A **port** is an interface owned by the application layer, describing a
  capability it needs (`ILibraryRepository`) without saying how it's
  fulfilled.
- An **adapter** is a concrete implementation of that port, living in
  infrastructure (`PostgresLibraryRepository` today — the active binding;
  `InMemoryLibraryRepository` stays registered but unbound; `MongoLibraryRepository`
  is the next one to add). NestJS's DI container plugs the adapter into the
  port at runtime via an injection token — the use case never imports the
  adapter, only the interface.

That symmetry works in both directions, not just outbound-to-a-database.
Every port and every adapter is split by **direction** first: `ports/out/` +
`adapters/out/<technology>/` are the driven side (the app calling out to
Postgres, in-memory storage, eventually Mongo); `ports/in/` +
`adapters/in/rest/` are the driving side (the outside world calling into the
app). A REST controller depends on `ICreateLibraryUseCase`, never on the
concrete `CreateLibraryUseCase` class — same inversion, mirrored.

Concretely in this codebase: every `application/ports/{in,out}/*.port.ts`
file is a port, every `infrastructure/adapters/{in,out}/**/*.ts` file is an
adapter, and the binding between them happens in exactly one place per
aggregate — that aggregate's `*.module.ts` `providers` array. Swapping
persistence technology later means writing a new adapter class and changing
one line in the module; it never means touching a use case.

## Why Clean Architecture (the Dependency Rule)

Hexagonal gives you the vocabulary (ports, adapters); Clean Architecture
gives you the rule for where things are *allowed* to depend on each other:

> Source code dependencies can only point inward. Nothing in an inner
> circle can know anything about something in an outer circle.

In this repo that's three concrete circles per aggregate:

```
infrastructure  →  application  →  domain
```

- **`domain`** (`entities/`, `valueObjects/`) is pure TypeScript. No NestJS
  decorators, no imports from `application` or `infrastructure`, nothing
  that couples it to a framework or a delivery mechanism. `Library.create()`
  works identically whether it's called from an HTTP controller, a test, or
  (hypothetically) a CLI.
- **`application`** (`ports/`, `useCases/`) depends only on `domain`
  and on the ports it defines — never on a concrete adapter, never on
  `express`/`Request`/`Response`.
- **`infrastructure`** (`adapters/in/rest/`, `adapters/out/<technology>/`) is
  where NestJS, HTTP, `class-validator`, TypeORM, and other
  persistence-specific code are allowed to live, because this is the
  outermost, most replaceable layer.

This is why controllers map to/from DTOs at the boundary instead of passing
`Library` entities around — the moment a domain object crossed into
`infrastructure` and got serialized directly, `infrastructure` would start
dictating what `domain` needs to look like, and the dependency arrow would
effectively reverse.

## Aggregates and the bounded context

`Library`, `Author`, and `Book` all live in one bounded context — this is a
**modular monolith**, not three microservices wearing a trenchcoat. They
still keep aggregate boundaries: **an aggregate never holds a direct
reference to another aggregate's object, only its id.** `Book` holds
`libraryId: LibraryId` and `authorId: AuthorId`, never a `Library` or
`Author` instance.

Enforcing that reference-by-id rule when *creating* a `Book` — verifying the
referenced `Library` and `Author` actually exist — happens in
`CreateBookUseCase`, which injects `ILibraryRepository` and
`IAuthorRepository` directly. No anti-corruption layer, no event bus,
because it's all one bounded context; just a use case checking two ports
before it constructs the entity.

## Package structure

![Package diagram](docs/architecture.diagram.png)

Each aggregate module repeats this exact shape — `Domain` (`entities` +
`valueObjects`) at the center, `Application` (`ports/{in,out}` +
`useCases`) wrapped around it, `Infrastructure` (`adapters/in/rest` +
`adapters/out/<technology>`) on the outside — with `Tests` living alongside
as its own top-level compartment. This is the literal blueprint `library/`,
`author/`, and `book/` were built from; the arrow direction between the
inner and outer boxes is the same inward-pointing dependency rule described
above.

## Domain model

![Class diagram](docs/class.diagram.png)

This is the full target shape for all three aggregates — entities, Value
Objects, ports, use cases, and controllers are exactly what's implemented
today. The `Postgres*Repository`/`Postgres*Entity`/`Postgres*Mapper` classes
on the diagram are implemented and are the active binding for every
aggregate; `InMemory*Repository` still exists behind the same port (useful
for tests, or a quick rollback) but nothing binds it. `Mongo*Repository` is
the one adapter on the diagram not built yet — see Roadmap below.

## Target persistence schema

![Entity-relationship diagram](docs/entityrelation.diagram.png)

The repository ports are storage-agnostic by design — that's what let this
start as in-memory `Map`s and land on Postgres later without touching a
single use case. This ER diagram is now the actual, migrated schema:
`libraries`, `authors`, and `books` tables (`src/migrations/postgres/`),
with `books.authorId`/`books.libraryId` as real foreign-key constraints. One
deliberate deviation from a "default" relational design: primary/foreign
keys here are typed `uuid`, not `int`/serial — matching the
`LibraryId`/`AuthorId`/`BookId` Value Objects (`value: string`) and keeping
entity creation synchronous, since an auto-increment `int` id wouldn't exist
until after insert (`@PrimaryColumn('uuid')`, not
`@PrimaryGeneratedColumn()`, on every Postgres entity — the domain layer
mints the id, not the database). `authorId`/`libraryId` as foreign keys are
still the relational mirror of `Book`'s `AuthorId`/`LibraryId` Value
Objects, never a loaded `Author`/`Library` object — the "reference by id,
not by object" rule holds at the database level too, enforced by TypeORM's
`@ManyToOne`/`@OneToMany` relation pair that only ever supplies the FK
constraint, and is never traversed by the mapper or repository.

## Where each concept lives

| Concept | Expressed as | Example |
| --- | --- | --- |
| Aggregate Root | A `domain/entities/*.entity.ts` class with a private constructor and static factories | `Library.create()` / `Library.reconstitute()` |
| Value Object | An immutable `domain/valueObjects/*.valueObject.ts` class — `get()`, no setters | `Address`, `LibraryId` |
| Outbound port | An interface + DI token in `application/ports/out/*.port.ts` | `ILibraryRepository` + `LIBRARY_REPOSITORY` |
| Inbound port | One per use case, in `application/ports/in/*.port.ts` — what the controller depends on instead of the concrete class | `ICreateLibraryUseCase` + `CREATE_LIBRARY_USE_CASE` |
| Use Case | One `application/useCases/*.useCase.ts` class, one `execute()` method, implements its inbound port | `CreateLibraryUseCase` |
| Outbound adapter | A concrete class in `infrastructure/adapters/out/<technology>/` implementing an outbound port | `PostgresLibraryRepository` (active), `InMemoryLibraryRepository` (unbound) |
| Inbound adapter | The REST controller in `infrastructure/adapters/in/rest/`, injecting inbound ports | `LibraryController` |
| Boundary mapping | DTOs in `infrastructure/adapters/in/rest/dto/`, translated in the controller only | `CreateLibraryDto` → `Library` → `LibraryResponseDto` |
| Composition root | Each aggregate's `providers` array, binding port tokens to adapters/use cases | `library.module.ts` |
| Cross-aggregate rule | A use case injecting another aggregate's outbound port directly | `CreateBookUseCase` checking `ILibraryRepository`/`IAuthorRepository` |

See [CLAUDE.md](./CLAUDE.md) for the full folder layout, file-naming
convention, and the complete list of non-negotiable rules this table is
summarizing.

## Stack

- **NestJS 11** + TypeScript, built via the Nest CLI's **webpack** builder
  (needed for the `@modules`/`@utils`/`@schemas`/`@middlewares`/`@tests`/
  `@config`/`@constants` path aliases to resolve at runtime, not just at
  type-check time).
- **Validation**: `class-validator` / `class-transformer`, enforced by a
  global `ValidationPipe` in `main.ts`.
- **Caching**: `@nestjs/cache-manager`, applied inside specific
  `Get...UseCase`s (single-entity lookups by id) rather than as a blanket
  HTTP interceptor — see [CLAUDE.md](./CLAUDE.md) for which use cases and
  why.
- **Persistence**: Postgres via `@nestjs/typeorm` + `typeorm`, run locally
  through `docker-compose.yml`. Schema and seed data are hand-written
  migrations (`src/migrations/postgres/`, run via `npm run migration:run`)
  — `synchronize` is off, the migrations are the source of truth.
- **Errors**: use cases throw Nest's built-in HTTP exceptions directly; a
  single global `HttpExceptionFilter` normalizes all of them to one JSON
  shape.
- **Testing**: Jest for both suites. Unit specs under
  `src/tests/<module>/*.test.ts` cover `domain` + `application` only
  (business logic). e2e specs under `test/*.e2e-spec.ts` boot the real
  `AppModule` against the real Postgres and cover controllers, DTOs, and
  repository adapters — the thin framework-glue layer unit tests
  deliberately skip. A `postman_collection.json` at the repo root covers
  the same HTTP surface for manual/exploratory use, outside the automated
  suites.

## Getting started

```bash
npm install
cp .env.example .env       # adjust PORT/DATABASE_* if needed
docker compose up -d       # starts Postgres on :5432
npm run migration:run      # creates the schema + seeds sample libraries/authors/books
npm run start:dev          # http://localhost:3000 (or your configured PORT)
```

Try it end to end — either import `postman_collection.json`, or:

```bash
curl -X POST http://localhost:3000/libraries \
  -H "Content-Type: application/json" \
  -d '{"name":"Central Library","address":"123 Main St"}'
```

## Run tests

```bash
npm run test        # unit — domain + application layers, no external dependencies
npm run test:cov    # unit, with coverage
npm run test:e2e    # e2e — boots the real AppModule against Postgres (needs docker compose up -d)
npm run build        # webpack build (validates path aliases resolve)
npm run lint          # ESLint + Prettier
```

## Roadmap

The structural skeleton is complete and runs end to end against real
Postgres persistence — schema and seed data are migrated, not
`synchronize`d, and both the inbound (`ports/in/`) and outbound
(`ports/out/`) sides of the hexagon are fully wired through DI tokens.
Remaining, per [CLAUDE.md](./CLAUDE.md)'s non-negotiable rule 8:

- `Mongo<Aggregate>Repository` adapters per aggregate, alongside the
  existing `Postgres*`/`InMemory*` ones, with the active technology
  selected via config in each module rather than hand-edited per binding.
- A real cache backend (Redis) behind the same `CACHE_MANAGER` port already
  wired into the read use cases.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com) — visualize your application graph and interact with it in real-time.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
