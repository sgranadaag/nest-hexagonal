# nest-core

Reusable NestJS **template** — project setup and tooling only, no
application architecture, no business logic, no entities. It's meant to be
copied per-service (microservice or monolith) and extended with a concrete
architecture following one of the architecture branches. See
[README.md](./README.md) for the copy/replicate workflow.

## Architecture branches

This repo keeps parallel branches, each building a different application
architecture on top of the same base (config, tooling, project setup):

- `main` — this branch. No architecture wired on purpose.
- `layered-architecture` — classic layered structure (controllers → services → repositories).
- `ddd-architecture` — Domain-Driven Design structure (domain, application, infrastructure layers).

More architecture branches can be added the same way — each forks from
`main`, not from another architecture branch, so they stay independent and
comparable. Only the folder structure, module conventions, and any
architecture-specific dependencies differ between branches; project setup,
configuration loading, and tooling stay identical.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run start` | Start the app |
| `npm run start:dev` | Start in watch mode |
| `npm run start:prod` | Run the production build (`dist/main`) |
| `npm run build` | Compile with `nest build` |
| `npm run lint` | Run ESLint (`--fix`) |
| `npm run format` | Run Prettier on `src/` and `test/` |
| `npm run test` | Run the Jest unit test suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:cov` | Run Jest with coverage |
| `npm run test:e2e` | Run e2e tests (`test/jest-e2e.json`) |

## Architecture at a glance

- **Config**: `ConfigModule.forRoot({ isGlobal: true })` in `src/app.module.ts` loads `.env` once at bootstrap; `ConfigService` is then injectable anywhere without re-importing the module. Never read `process.env` directly in application code — go through `ConfigService`.
- **Entry point**: `src/main.ts` creates the Nest app and resolves the listen port via `ConfigService`.
- This branch has no persistence layer, no auth, and no domain modules — those are added by whichever architecture branch (or downstream service) builds on top of this base.

## Good practices

- Keep this repo free of business logic, entities, and architecture decisions — it's a base template, not a service to build on directly.
- No secrets committed; use `.env` (gitignored) for real values, keep `.env.example` in sync when adding new environment variables.
- When adding a new architecture branch, keep this base (config, tooling, scripts) untouched unless the change belongs in every branch — architecture-specific decisions belong in that branch only.

## Testing

- Unit tests live alongside source files (`*.spec.ts`), e2e tests live in `test/` (`*.e2e-spec.ts`).
- Run `npm test` and `npm run build` before considering a change done.
