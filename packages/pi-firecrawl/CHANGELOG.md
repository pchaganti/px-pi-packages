# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-08-06

### Added
- Added support for relocated agent directories: the global config path now resolves through pi's `getAgentDir()`, honoring `PI_CODING_AGENT_DIR`.

### Changed
- A config written by an earlier release to `~/.pi/agent/extensions/` is still read when `PI_CODING_AGENT_DIR` points elsewhere and the relocated directory has no config of its own. The legacy file is read in place and never copied or moved.
- Invalid-config diagnostics now route through the extension UI when one is attached, instead of writing to the console. Tool `execute` already received an extension context and discarded it.

### Fixed
- Fixed the default-config write being retried on every tool call. Failures are now latched per path, so a read-only home produces one warning and no repeated syscalls.
- Fixed console writes corrupting the frame in pi 0.84's fullscreen TUI, whose renderer repaints differentially and never clears stray output.
- Fixed the README claiming pi v0.51.0 or later; the declared peer floor of v0.74.0 is accurate.

## [1.0.2] - 2026-06-07

### Changed
- Resolved dependency audit findings.

## [1.0.1] - 2026-05-07

### Changed
- Migrated pi dependencies to the `@earendil-works` namespace.

## [1.0.0] - 2026-02-11

### Added
- Initial `@benvargas/pi-firecrawl` package, replacing `pi-firecrawl-mcp` with direct Firecrawl REST API access.
