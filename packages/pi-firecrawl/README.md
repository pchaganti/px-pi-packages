# @benvargas/pi-firecrawl

Firecrawl tools for [pi](https://github.com/badlogic/pi-mono), the AI coding agent.

Provides focused Firecrawl REST API access for:

- `firecrawl_scrape`
- `firecrawl_map`
- `firecrawl_search`

## Features

- **Scrape** (`firecrawl_scrape`) — Scrape a single URL
- **Map** (`firecrawl_map`) — Discover URLs on a site
- **Search** (`firecrawl_search`) — Search the web and optionally scrape results
- **Tool allowlist** — Enable/disable tools via `tools` config
- **Configurable limits** — Client-side truncation with configurable max bytes/lines
- **Multiple config sources** — JSON config, environment variables, or CLI flags
- **Direct REST API** — Simple, fast, no protocol overhead

## Installation

```bash
pi install npm:@benvargas/pi-firecrawl
```

Or try without installing:

```bash
pi -e npm:@benvargas/pi-firecrawl
```

## Setup

Get an API key from [firecrawl.dev](https://firecrawl.dev) and configure it using one of these methods.

### Option 1: Environment Variable

```bash
export FIRECRAWL_API_KEY="your_firecrawl_api_key"
pi
```

### Option 2: JSON Config

Create `~/.pi/agent/extensions/firecrawl.json`:

```json
{
  "url": "https://api.firecrawl.dev",
  "apiKey": "your_firecrawl_api_key",
  "headers": null,
  "tools": ["firecrawl_scrape", "firecrawl_map", "firecrawl_search"],
  "timeoutMs": 30000,
  "maxBytes": 51200,
  "maxLines": 2000
}
```

If you want to disable search, remove it from the `tools` array.

### Option 3: CLI Flags

```bash
pi --firecrawl-api-key=your_firecrawl_api_key
```

## Usage

Once installed, the AI can use these tools when appropriate:

```text
"Scrape https://example.com and get the main content"
"Map docs.example.com and list likely API pages"
"Search for React tutorials and summarize top results"
```

## Tools

### firecrawl_scrape

Scrape a single URL.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `url` | Target URL (required) | — |
| `formats` | Output formats array | — |
| `onlyMainContent` | Extract only main content | — |
| `waitFor` | Wait time in milliseconds | — |
| `timeout` | Request timeout | — |
| `mobile` | Use mobile viewport | — |
| `includeTags` | Tags to include | — |
| `excludeTags` | Tags to exclude | — |
| `skipTlsVerification` | Skip TLS verification | — |
| `piMaxBytes` | Client-side max bytes override | — |
| `piMaxLines` | Client-side max lines override | — |

### firecrawl_map

Discover URLs on a site.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `url` | Base URL to map (required) | — |
| `search` | Search query to filter URLs | — |
| `sitemap` | Sitemap handling mode (`include`, `skip`, `only`) | — |
| `includeSubdomains` | Include subdomains | — |
| `limit` | Maximum URLs to return | — |
| `ignoreQueryParameters` | Ignore query parameters | — |
| `piMaxBytes` | Client-side max bytes override | — |
| `piMaxLines` | Client-side max lines override | — |

### firecrawl_search

Search the web and optionally scrape results.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `query` | Search query (required) | — |
| `limit` | Maximum results | — |
| `lang` | Language code | — |
| `country` | Country code | — |
| `scrapeOptions` | Scrape options for results | — |
| `piMaxBytes` | Client-side max bytes override | — |
| `piMaxLines` | Client-side max lines override | — |

## Configuration

### Config File Locations

Config files are loaded in order (first match wins):

1. Path from `--firecrawl-config` flag
2. Path from `FIRECRAWL_CONFIG` environment variable
3. `./.pi/extensions/firecrawl.json` (project-level)
4. `~/.pi/agent/extensions/firecrawl.json` (global)

If none exist, the extension writes a default config to the global path with `apiKey` set to `null`.

### Config File Format

```json
{
  "url": "https://api.firecrawl.dev",
  "apiKey": null,
  "headers": null,
  "tools": ["firecrawl_scrape", "firecrawl_map", "firecrawl_search"],
  "timeoutMs": 30000,
  "maxBytes": 51200,
  "maxLines": 2000
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIRECRAWL_URL` | API base URL | `https://api.firecrawl.dev` |
| `FIRECRAWL_API_KEY` | Firecrawl API key (Bearer token) | — |
| `FIRECRAWL_TIMEOUT_MS` | Request timeout (ms) | `30000` |
| `FIRECRAWL_TOOLS` | Comma-separated tool list | — |
| `FIRECRAWL_MAX_BYTES` | Max bytes to keep from output | `51200` |
| `FIRECRAWL_MAX_LINES` | Max lines to keep from output | `2000` |
| `FIRECRAWL_CONFIG` | Path to JSON config file | — |

### CLI Flags

| Flag | Description |
|------|-------------|
| `--firecrawl-url` | Override the Firecrawl API base URL |
| `--firecrawl-api-key` | Firecrawl API key |
| `--firecrawl-timeout-ms` | HTTP timeout (milliseconds) |
| `--firecrawl-config` | Path to JSON config file |
| `--firecrawl-tools` | Comma-separated tool list |
| `--firecrawl-max-bytes` | Max bytes to keep from output |
| `--firecrawl-max-lines` | Max lines to keep from output |

## Output Truncation

Tool output is automatically truncated to prevent context window overflow:

- **Default limits**: 51200 bytes and 2000 lines
- **Client overrides**: models can request `piMaxBytes`/`piMaxLines` (clamped to configured max)
- **Temp files**: when truncated, full output is saved to a temp file with the path included in the response

## Requirements

- pi v0.51.0 or later
- Firecrawl API key from [firecrawl.dev](https://firecrawl.dev)

## Uninstall

```bash
pi remove npm:@benvargas/pi-firecrawl
```

## License

MIT
