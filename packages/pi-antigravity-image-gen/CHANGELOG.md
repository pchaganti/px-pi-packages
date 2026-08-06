# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2026-08-06

### Fixed
- Fixed the deprecation warning never reaching the user in pi 0.84's fullscreen TUI. It fired at extension load, before the interactive UI starts, and the alt-screen setup then cleared the terminal — defeating this package's only remaining function. It now emits from a `session_start` handler through the extension UI when one is attached, falling back to the console when headless, and fires once per load.
- Fixed the documented uninstall command, which was a silent no-op. pi classifies a source as npm only when prefixed with `npm:`; a bare scoped name is treated as a local path, which `remove()` ignores. The README now says `pi uninstall npm:@benvargas/pi-antigravity-image-gen`.

## [1.1.2] - 2026-05-07

### Changed
- Migrated pi dependencies to the `@earendil-works` namespace.

## [1.1.1] - 2026-02-01

### Deprecated
- Deprecated and disabled the package. Google began banning accounts that use third-party Antigravity harnesses, so it no longer registers image-generation tools and exists only so existing installs fail closed with a clear warning.

### Fixed
- Refreshed Antigravity headers and error context.

## [1.1.0] - 2026-02-01

### Added
- Added automatic default config file creation.
- Aligned default configs with preferred settings.

### Changed
- Updated the extension for pi 0.51.0.

## [1.0.1] - 2026-02-01

### Changed
- Overhauled the Antigravity image generation extension.

## [1.0.0] - 2026-01-29

### Added
- Initial `@benvargas/pi-antigravity-image-gen` package.
