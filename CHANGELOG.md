# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
