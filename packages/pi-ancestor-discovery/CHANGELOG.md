# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2026-08-06

### Changed
- Config read and write diagnostics now route through the extension UI when one is attached. The `resources_discover` handler previously discarded the context pi passes as its second argument; it is now accepted and threaded to the config helpers as an optional trailing parameter, so existing callers and the `_test` helpers are unaffected.

### Fixed
- Fixed console writes corrupting the frame in pi 0.84's fullscreen TUI, whose renderer repaints differentially and never clears stray output.
- Fixed the README advertising pi v0.51.0+ against a declared peer floor of v0.74.0, which sent users on older pi into a peer resolution failure.

### Note
- Upgrading to pi 0.83.0 or later fixes package-managed skills losing their source labels when this extension contributes skill paths ([pi#6968](https://github.com/earendil-works/pi/issues/6968)). No change was required in this package.

## [1.1.2] - 2026-05-07

### Changed
- Migrated pi dependencies to the `@earendil-works` namespace.

## [1.1.1] - 2026-02-03

### Added
- Added `.agents/skills` to the default discovery config.

## [1.1.0] - 2026-02-01

### Changed
- Updated the extension for pi 0.51.0.

## [1.0.1] - 2026-02-01

### Added
- Added uninstall instructions.

## [1.0.0] - 2026-02-01

### Added
- Initial `@benvargas/pi-ancestor-discovery` package, using the `resources_discover` hook to walk upward from the working directory and discover resource folders at each ancestor level.
