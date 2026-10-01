# GraphQL in this project

This document explains how the GraphQL layer works end to end: how it's wired into the app, what each decorator/class does, and how to actually send requests. It assumes you're already familiar with the REST side (`in/rest/`) — every concept here is introduced by comparing it to its REST equivalent.

## 1. The big picture

REST exposes many URLs (`/libraries`, `/libraries/:id`, `/books/author/:authorId`, ...), one per operation, and the HTTP verb (`GET`/`POST`/`DELETE`) tells the server what to do.

GraphQL exposes **one single URL** — `POST /graphql` — for everything. What operation you want, and what data you want back, is described entirely in the request **body**, as a small query language (also called "GraphQL"). The server reads that body, figures out which operation you asked for, runs it, and returns exactly the fields you asked for — no more, no less.

That's really the whole idea: instead of "one endpoint per shape of data", you get "one endpoint, and you describe the shape you want".

## 2. How it's wired into the app

GraphQL isn't a separate server or process — it's just another module registered on the same Nest `AppModule`, exactly like `TypeOrmModule` or `CacheModule`. See `src/app.module.ts`:

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
  includeStacktraceInErrorResponses: false,
}),
```

- **`driver: ApolloDriver`** — Nest can plug in different GraphQL server implementations; this project uses [Apollo Server](https://www.apollographql.com/docs/apollo-server/).
- **`autoSchemaFile`** — this project uses the **code-first** approach: you write TypeScript classes decorated with `@ObjectType()`/`@InputType()`/`@Field()` (see below), and Nest *generates* the GraphQL schema from them automatically on every boot, writing it to `src/schema.gql`. That file is gitignored — never hand-edit it, it's always regenerated from your TypeScript code. (The alternative, "schema-first", is writing the `.graphql` schema by hand first and generating types from it — this project doesn't use that approach.)
- **`sortSchema`** — just keeps the generated schema's fields alphabetically sorted, so diffs are stable.
- **`includeStacktraceInErrorResponses: false`** — never leak stack traces to a client, same philosophy as the REST side's `HttpExceptionFilter`.

Because it's just another module, it needs **nothing special** to run — `npm run start:dev` boots REST and GraphQL together, on the same port. See the "How do I run it?" section in the repo's other docs — short answer: exactly the same as REST, there's no separate command.

## 3. The moving parts, mapped to REST

| REST concept | GraphQL equivalent | Where it lives |
| --- | --- | --- |
| `@Controller('libraries')` class | `@Resolver()` class | `infrastructure/adapters/in/graphql/library.resolver.ts` |
| `@Get(':id')` method | `@Query()` method | inside the resolver |
| `@Post()` / `@Delete()` method | `@Mutation()` method | inside the resolver |
| `@Param()` / `@Body()` | `@Args()` | resolver method parameters |
| Response DTO (`LibraryResponseDto`) | `@ObjectType()` class | `infrastructure/adapters/in/graphql/dto/library.type.ts` |
| Request DTO (`CreateLibraryDto`) | `@InputType()` class | `infrastructure/adapters/in/graphql/dto/createLibrary.input.ts` |
| `class-validator` decorators (`@IsString()`, ...) | *the same* `class-validator` decorators | on the `@InputType()` class |

Crucially: **the resolver calls the exact same use case as the controller**, through the exact same injected port/token. A resolver is just a different "front door" into the same business logic — it contains zero business logic of its own, exactly like a controller.

## 4. The decorators, one by one

All of these come from `@nestjs/graphql`.

### `@Resolver()`

Marks a class as a GraphQL resolver — the thing Nest scans to find your queries and mutations. Takes an optional "type function" telling Nest which `@ObjectType()` this resolver is primarily about (mostly used for more advanced field-resolution features this project doesn't use yet).

```ts
@Resolver(() => LibraryType)
export class LibraryResolver {
  constructor(
    @Inject(CREATE_LIBRARY_USE_CASE)
    private readonly createLibraryUseCase: ICreateLibraryUseCase,
    // ...same DI pattern as the controller
  ) {}
}
```

### `@Query()` and `@Mutation()`

Both decorate a method on a resolver. **`@Query()`** is for reading data (side-effect free); **`@Mutation()`** is for anything that changes data (create/update/delete) — this is a *convention* GraphQL asks you to follow, not something the server enforces.

The argument passed to the decorator — `() => LibraryType` — tells Nest (and the generated schema) what type this operation returns. This has to be a function (not the class directly) so the file can reference types that haven't finished loading yet.

```ts
@Query(() => LibraryType)
async library(
  @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
): Promise<LibraryType> {
  const library = await this.getLibraryUseCase.execute(id);
  return LibraryType.fromDomain(library);
}
```

This is the whole method — identical shape to `LibraryController.getLibrary()`: call the use case, map the domain entity to the outward-facing shape, return it. The method name (`library`) becomes the field name you call in a query.

A query returning a **list** just wraps the type in an array, e.g. `Book`'s `booksByAuthor`:

```ts
@Query(() => [BookType])
async booksByAuthor(
  @Args('authorId', { type: () => ID }, ParseUUIDPipe) authorId: string,
): Promise<BookType[]> {
  const books = await this.getBookByAuthorUseCase.execute(authorId);
  return books.map((book) => BookType.fromDomain(book));
}
```

A `@Mutation()` that deletes something has no meaningful "return value" the way a REST `204 No Content` has no body — GraphQL doesn't have a "void" type, so this project's convention is to return `Boolean!` (`true` on success):

```ts
@Mutation(() => Boolean)
async deleteLibrary(
  @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
): Promise<boolean> {
  await this.deleteLibraryUseCase.execute(id);
  return true;
}
```

### `@Args()`

The GraphQL equivalent of `@Param()`/`@Query()`/`@Body()` in REST — it pulls a named argument out of the incoming GraphQL operation.

- `@Args('id', { type: () => ID }, ParseUUIDPipe) id: string` — pulls the `id` argument, tells the schema it's of GraphQL's built-in `ID` scalar type, and runs it through `ParseUUIDPipe` — **the exact same pipe class REST uses on `@Param('id', ParseUUIDPipe)`**. Pipes in Nest are transport-agnostic; the same class works for both.
- `@Args('input') input: CreateLibraryInput` — pulls the whole `input` argument as one object, and because `CreateLibraryInput` is itself decorated (see below), Nest infers its GraphQL shape from the class — no need for an explicit `{ type: () => ... }` here.

### `@ObjectType()` and `@Field()`

`@ObjectType()` marks a class as something GraphQL clients can query fields **from** — it's the "shape of the data you get back", equivalent to a REST response DTO.

```ts
@ObjectType('Library')
export class LibraryType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field()
  readonly address: string;

  private constructor(id: string, name: string, address: string) {
    this.id = id;
    this.name = name;
    this.address = address;
  }

  static fromDomain(library: Library): LibraryType {
    return new LibraryType(
      library.getId().get(),
      library.getName(),
      library.getAddress().get(),
    );
  }
}
```

Every property a client should be able to ask for needs `@Field()` on it. Without `@Field()`, the property is invisible to GraphQL — a client can't request it, and it won't show up in the generated schema, even though it's a completely normal TypeScript property.

Why explicit property declarations instead of the constructor-parameter shorthand REST's DTOs use (`private constructor(public readonly id: string, ...)`)? Because `@Field()` is a **property** decorator — it needs a real class field to attach to. TypeScript's "parameter properties" shorthand doesn't create something `@Field()` can decorate the same way, so these classes declare each field explicitly and assign it in the constructor body instead.

Notice `@Field()` sometimes takes an argument (`() => ID`) and sometimes doesn't. TypeScript's own type (`string`) is ambiguous for GraphQL's purposes — a `string` could be GraphQL's `String` or its `ID` scalar; a `number` could be `Int` or `Float`. Nest can only auto-infer the unambiguous cases (`string → String`, `boolean → Boolean`), so anywhere the mapping is ambiguous you have to say so explicitly:

| TypeScript type | Needs explicit `@Field(() => X)`? | Example in this repo |
| --- | --- | --- |
| `string` (plain text) | No — inferred as `String` | `LibraryType.name` |
| `string` (an id) | Yes — `@Field(() => ID)` | `LibraryType.id`, `BookType.authorId` |
| `number` (a whole number) | Yes — `@Field(() => Int)` | `AuthorType.booksAccount` |
| `number` (a decimal) | Yes — `@Field(() => Float)` | `HealthType.uptime` |
| `boolean` | No — inferred as `Boolean` | (mutation return types) |

### `@InputType()`

The mirror image of `@ObjectType()`: marks a class as something a client can **send in**, as a mutation/query argument — equivalent to a REST request DTO. Unlike `@ObjectType()`, an `@InputType()` class keeps the same `class-validator` decorators the REST DTOs already use, since the same global `ValidationPipe` (from `main.ts`) runs for GraphQL arguments too:

```ts
@InputType()
export class CreateLibraryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  address: string;
}
```

Stacking `@Field()` above the `class-validator` decorators is the norm here: `@Field()` tells the *schema* this property exists and what type it is; the `class-validator` decorators tell the *validation pipe* what values are acceptable. They serve different systems and don't interfere with each other.

## 5. What happens when a request comes in

Take `mutation { createLibrary(input: { name: "X", address: "Y" }) { id name address } }` as an example, sent to `POST /graphql`:

1. Apollo parses the request body and figures out it's calling the `createLibrary` mutation.
2. Nest's `ValidationPipe` runs against the `input` argument, validating it as a `CreateLibraryInput` — same as it would validate a REST body.
3. `LibraryResolver.createLibrary()` runs, calling `this.createLibraryUseCase.execute(input.name, input.address)` — **the exact same `CreateLibraryUseCase` the REST controller calls**, injected through the same `CREATE_LIBRARY_USE_CASE` token.
4. The use case runs its business logic (exactly as it does for REST) and returns a `Library` domain entity.
5. The resolver maps that entity to a `LibraryType` via `LibraryType.fromDomain(library)` — same static-factory pattern as `LibraryResponseDto.fromDomain(library)`.
6. Apollo serializes only the fields the client asked for (`id name address` in this example) into the response.

If the use case throws (e.g. `NotFoundException`), Apollo catches it and returns a `200 OK` response whose body has an `errors` array instead of (or alongside) `data` — GraphQL never uses HTTP status codes to signal an application-level error, only for things like a malformed request body. See `middlewares/httpException.filter.ts`'s `host.getType() !== 'http'` guard for how this project makes sure its REST-oriented global exception filter doesn't interfere with that.

## 6. How to actually send requests

Every request — query or mutation — is a `POST` to `/graphql` with a JSON body shaped like:

```json
{
  "query": "the GraphQL operation, as text",
  "variables": { "...": "optional values referenced by the query" }
}
```

### In a browser

Just open `http://localhost:3400/graphql` (adjust the port to your `.env`'s `PORT`) directly — in non-production mode, Apollo Server serves an interactive Sandbox where you can browse the schema and run queries by hand, with autocomplete.

### With curl

```bash
curl -X POST http://localhost:3400/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createLibrary(input: { name: \"Central Library\", address: \"123 Main St\" }) { id name address } }"}'
```

Using `$variables` instead of inlining values (recommended for anything beyond a one-off test):

```bash
curl -X POST http://localhost:3400/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateLibrary($input: CreateLibraryInput!) { createLibrary(input: $input) { id name address } }",
    "variables": { "input": { "name": "Central Library", "address": "123 Main St" } }
  }'
```

### With Postman

The `GraphQL` folder in `postman_collection.json` already has every operation set up this way (Postman has a native "GraphQL" body mode with separate `query`/`variables` panes).

### Query syntax cheat-sheet

```graphql
# A query: pick exactly the fields you want back
query {
  library(id: "b99654e8-...") {
    id
    name
    address
  }
}

# A mutation: same idea, but for something that changes data
mutation {
  createLibrary(input: { name: "Central Library", address: "123 Main St" }) {
    id
    name
    address
  }
}

# A query returning a list of objects
query {
  booksByAuthor(authorId: "e05df6f0-...") {
    id
    title
  }
}
```

You always choose which fields come back — asking for just `id` on `library(...)` returns `{ "data": { "library": { "id": "..." } } }` and nothing else.

## 7. Where to look next

- `src/schema.gql` — the full, always-up-to-date generated schema (every type, query, and mutation this API exposes). Regenerated on every boot; read it, never edit it.
- `CLAUDE.md` — the project's architecture rules, including exactly how GraphQL fits into the hexagonal/DDD structure (folder conventions, DI rules, the REST/GraphQL parity rule).
- `test/graphql/*.e2e-spec.ts` — real, runnable examples of every operation, including how errors and validation failures look in the response body.
