# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-08-06

### Added
- Added support for relocated agent directories: the global config path now resolves through pi's `getAgentDir()`, honoring `PI_CODING_AGENT_DIR`.

### Changed
- A config written by an earlier release to `~/.pi/agent/extensions/` is still read when `PI_CODING_AGENT_DIR` points elsewhere and the relocated directory has no config of its own. The legacy file is read in place and never copied or moved.

### Fixed
- Fixed the default-config write being retried on every `loadConfig()` call. `loadConfig()` runs roughly six times per tool invocation, so a read-only home produced six failed syscalls and six warnings per tool call. Failures are now latched per path and warned about once.
- Fixed the test suite provisioning a real config into the developer's or CI home directory. Tests now point the config flag at a temporary directory.
- Fixed the README claiming pi v0.51.0 or later. The package uses `promptSnippet`, which does not exist at that version; the declared peer floor of v0.74.0 is accurate.

## [1.1.1] - 2026-05-07

### Changed
- Migrated pi dependencies to the `@earendil-works` namespace.

## [1.1.0] - 2026-02-01

### Added
- Added automatic default config file creation.
- Aligned default configs with preferred settings.

### Changed
- Updated the extension for pi 0.51.0.

## [1.0.0] - 2026-01-30

### Added
- Initial `@benvargas/pi-exa-mcp` package providing Exa MCP tools for web search and code context.
