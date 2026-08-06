# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-08-06

### Added
- Added default verbosity entries for GPT-5.6 Sol, Terra, and Luna, which support `text.verbosity` but were absent from the shipped defaults.
- Added support for relocated agent directories: the global config path now resolves through pi's `getAgentDir()`, honoring `PI_CODING_AGENT_DIR`.

### Changed
- Default verbosity entries now match pi's `openai-codex` catalog exactly.
- `gpt-5.4-mini` now defaults to `medium`, mirroring its upstream `default_verbosity`. Every other model stays at `low`.
- A config written by an earlier release to `~/.pi/agent/extensions/` is still read when `PI_CODING_AGENT_DIR` points elsewhere and the relocated directory has no config of its own. The legacy file is read in place and never copied or moved.

### Removed
- Removed default entries for `gpt-5.3-codex`, `gpt-5.2`, and `codex-auto-review`. None appear in pi's `openai-codex` catalog, so these keys could never match a request. `codex-auto-review` remains a live Codex model but is not exposed by pi.

### Fixed
- Fixed README model tables and the copy-pasteable debug command, which pinned `--model openai-codex/gpt-5.3-codex` — a model that no longer resolves.
- Fixed a stale `gpt-5.3-codex` entry in the package keywords.

## [1.0.1] - 2026-05-07

### Changed
- Migrated pi dependencies to the `@earendil-works` namespace.

## [1.0.0] - 2026-04-24

### Added
- Initial `@benvargas/pi-openai-verbosity` package, setting OpenAI Responses `text.verbosity` per model for the `openai-codex` provider through the `before_provider_request` hook.
- Added the `/openai-verbosity` command and project-over-global config precedence.
