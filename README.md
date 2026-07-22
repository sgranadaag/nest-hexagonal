# nest-core

Reusable [NestJS](https://nestjs.com) template — the base starting point for
new services, whether built as a microservice or a monolith. It contains
only what every service needs regardless of internal architecture (project
setup, environment configuration, tooling) and stays intentionally free of
any specific architecture pattern or business logic.

This is the **core** branch: it has no application architecture wired on
purpose. Parallel architecture branches (e.g. `layered-architecture`,
`ddd-architecture`) fork from here, each building out its own folder
structure and conventions on top of this same base. See
[CLAUDE.md](./CLAUDE.md) for details.

## Stack

- **NestJS 11** + TypeScript (strict-ish — see `tsconfig.json`)
- **Configuration**: `@nestjs/config`, loading `.env` via `ConfigModule.forRoot({ isGlobal: true })`. `ConfigService` is injectable anywhere without re-importing the module.
- **Testing**: Jest (unit) + Supertest (e2e)
- **Linting/formatting**: ESLint (flat config) + Prettier

## Getting started

```bash
npm install
cp .env.example .env   # adjust PORT and any other values
npm run start:dev      # http://localhost:3000 (or your configured PORT)
```

## How to use this as a template for a new service

1. Pick a starting point: this `main` branch if you're implementing your own
   architecture from scratch, or an existing architecture branch (e.g.
   `ddd-architecture`) if one already matches what you want to build.
2. Copy that branch as the new service's starting point and rename it in
   `package.json`.
3. Update `.env.example` / `.env` with the new service's own configuration.
4. Build your domain/features following that branch's structure and
   conventions instead of starting from scratch.
5. Run `npm test` and `npm run build` before shipping.

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
