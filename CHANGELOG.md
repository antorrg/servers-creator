# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - 2026-10-21

### Added

- Added deliberate ESLint exception documentation (`001 — Use of any in Prisma BaseRepository Generics`) in `docs/explanation/typescript-eslint-exceptions.md` explaining Prisma model delegate parameter contravariance.

### Changed

- **Sequelize Repository Layer**:
  - Strongly typed `BaseRepository` with `TModel extends Model = Model` and `parserFn: (model: TModel) => TDTO`.
  - Replaced `any` assertions in queries with Sequelize native `WhereOptions` and `Order` types.
  - Used native `model.get()` in `BaseRepository.delete` instead of `any` property access.
  - Strongly typed `UserRepository` with `UserDb` model, eliminating `model as any` and `record: any`.
  - Typed `createSeedRandomElements` helper with `CreationAttributes<UserDb>[]`.
- **Fastify Infrastructure**:
  - Replaced `(err as any).statusCode` and `(err as any).status` with safe type narrowing via `Record<string, unknown>`.
  - Replaced `Record<string, any>` in `SessionData` with `Partial<Session> & Record<string, unknown>`.
  - Typed Fastify session configuration with `FastifySessionOptions` and `SessionStore` from `@fastify/session`.
  - Resolved `DbSessionStore` constructor options with strongly typed `ResolvedSessionStoreOptions` without `as any`.
- **Fastify Standalone App**:
  - Replaced empty `ServiceResponse<T>` interface with type alias `export type ServiceResponse<T> = T`.
  - Updated `IGenericService.delete` and `UserService.delete` return types to `ServiceResponse<string>` to match the deletion message return value.

### Fixed

- Fixed switch/case indentation and trailing comma in standalone Fastify `logger.ts`.
- Fixed ESLint function spacing (`space-before-function-paren`) and unused parameter warnings in Fastify controllers and auth pre-handlers.
- Linked `eslint-disable-line` directives in Prisma `BaseRepository` directly to Exception `001`.

## [0.0.2] - 2026-10-18

### Changed

- Reverting from Sequelize 7 alpha-48 to Sequelize 6 for greater stability; version 7 is being retained and will be released as an optional feature in a future patch.
- Adjust the structure of generated READMEs for better consistency

### Fixed

- Fixed runtime imports in Sequelize session model template (`Model` and `DataTypes` imported as values instead of types).
- Fixed error propagation in Drizzle database startup and teardown.

## [0.0.1]

### Add

- Functionality was added for drizzle-orm

- Server functionalities were downloaded and tested.

- Fix errors in imports and names

## [0.0.1-beta.2]

### Changed

- Fix errors in cli

## [0.0.1-beta.1] - 2026-10-07

### Changed

- Fix errors in imports on standAlone templates.
- Customize logSuccessMessage function

## [0.0.1-beta.0] - 2026-10-07

### Added

- Initial release of the interactive TypeScript backend generator.
- Support for Express and Fastify projects.
- PostgreSQL integration with Prisma or Sequelize.
- Standalone project generation without a database.
- Optional session and cookie authentication scaffolding.
- Feature-first project structure with shared utilities and configuration.
- Preconfigured logging, error handling, and environment configuration.
- Generated project documentation.
