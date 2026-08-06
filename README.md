# nest-core

A [NestJS](https://nestjs.com) repository that exists to answer one question
in different ways: **what does Clean Architecture actually look like once it
has to survive contact with a real deployment topology?**

## This branch: the landing page

`main` is intentionally thin. It carries no domain, no ports, no adapters —
just the shared foundation (project setup, environment configuration,
tooling) that every other branch forks from, plus this document as the map
of everything else in the repository. If you landed here looking for an
architecture to build on, you're one step away: keep reading, then check out
the branch that matches what you're building.

## The idea behind the repository

Clean Architecture is a set of dependency rules, not a folder structure —
the domain sits at the center, insulated from delivery mechanisms and
infrastructure, and everything else is arranged around it as replaceable
detail. What that looks like in practice bends depending on *how* the
service is shipped: a single deployable unit answers to different pressures
than a constellation of independently deployed ones, even when the
underlying business rules and boundaries are identical.

Rather than pick one shape and call it "the" architecture, this repository
holds the same discipline up against different distributions, side by side,
each as a complete, working reference — real persistence, real migrations,
real middleware and caching, real ports and adapters, not a sketch. The
comparison is the point: same core rules, same commitment to the dependency
inversion at the heart of hexagonal design, different topology.

## Branches

| Branch | Role |
| --- | --- |
| `main` | Landing branch. No architecture, no domain — shared base only. |
| `hexagonal-monolith` *(planned)* | Clean/hexagonal architecture shaped as a single deployable service. |
| `hexagonal-microservice` *(planned)* | The same architectural core, redrawn for a distributed, independently-deployed topology. |

Each architecture branch forks from `main`, not from one another, so they
stay independent and directly comparable rather than drifting into a shared
lineage. Only the shared base (config, tooling, project setup) is meant to
stay identical across branches — everything architecture-specific belongs
to the branch it lives in.

This table is expected to grow. The monolith/microservice split is the
starting pair, not a ceiling — additional distributions or architectural
takes (event-driven, modular-monolith, serverless, or others that turn out
to be worth exploring) can be added the same way, each earning its own
branch and its own entry here. The concrete folder structure, module
conventions, and infrastructure choices for each branch will be documented
in that branch's own README once development on it begins — this repo-level
document stays deliberately at the topology level, not the implementation
level.

## Stack (shared base)

- **NestJS 11** + TypeScript (strict-ish — see `tsconfig.json`)
- **Configuration**: `@nestjs/config`, loading `.env` via `ConfigModule.forRoot({ isGlobal: true })`. `ConfigService` is injectable anywhere without re-importing the module.
- **Testing**: Jest (unit) + Supertest (e2e)
- **Linting/formatting**: ESLint (flat config) + Prettier

Everything architecture-specific — persistence, migrations, caching,
middleware, and the domain/application/infrastructure modeling itself —
is added per branch, not here.

## Getting started

```bash
npm install
cp .env.example .env   # adjust PORT and any other values
npm run start:dev      # http://localhost:3000 (or your configured PORT)
```

## Using this repository for a new service

1. Decide on a topology: monolith or microservice (or whichever branch
   matches what you're building, as the catalog grows).
2. Check out that architecture branch — not `main` — as your starting
   point.
3. Copy it out as the new service's starting point and rename it in
   `package.json`.
4. Update `.env.example` / `.env` with the new service's own configuration.
5. Build your domain/features following that branch's structure and
   conventions instead of starting from scratch.
6. Run `npm test` and `npm run build` before shipping.

See [CLAUDE.md](./CLAUDE.md) for commands and conventions.

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com) — visualize your application graph and interact with it in real-time.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
