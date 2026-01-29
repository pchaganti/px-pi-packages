# @benvargas/pi-antigravity-image-gen

Image generation tool for [pi](https://github.com/badlogic/pi-mono) using Google Antigravity's image models (Gemini, Imagen).

Generated images are returned as tool result attachments for inline terminal rendering.

## Features

- **Multiple models** -- gemini-3-pro-image (default), imagen-3
- **Aspect ratios** -- 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
- **Inline rendering** -- images display directly in the terminal
- **Flexible save options** -- save to project, global, or custom directory
- **Config file support** -- persistent settings via JSON config

## Installation

```bash
pi install npm:@benvargas/pi-antigravity-image-gen
```

Or try without installing:

```bash
pi -e npm:@benvargas/pi-antigravity-image-gen
```

## Setup

Authenticate with Google Antigravity via OAuth:

```
/login
```

Select `google-antigravity` from the provider list. This stores OAuth credentials that the extension uses automatically.

## Usage

Once authenticated, ask pi to generate images naturally:

```
"Generate an image of a sunset over mountains"
"Create a 16:9 wallpaper of a cyberpunk city"
"Generate an imagen-3 picture of a cat in a spacesuit"
```

The extension registers a `generate_image` tool that the model calls automatically when image generation is requested.

### Tool Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `prompt` | Image description (required) | -- |
| `model` | Model ID (`gemini-3-pro-image`, `imagen-3`) | `gemini-3-pro-image` |
| `aspectRatio` | Image dimensions | `1:1` |
| `save` | Save mode (`none`, `project`, `global`, `custom`) | `none` |
| `saveDir` | Directory for `save=custom` | `PI_IMAGE_SAVE_DIR` |

## Saving Images

By default, images are only displayed inline and not saved to disk. Configure saving via tool parameter, environment variable, or config file (in order of priority):

### Tool parameter

The model can pass `save` directly when calling the tool.

### Environment variables

```bash
export PI_IMAGE_SAVE_MODE=global        # none|project|global|custom
export PI_IMAGE_SAVE_DIR=/path/to/dir   # required when mode=custom
```

### Config file

Create a JSON config file (project overrides global):

**Global**: `~/.pi/agent/extensions/antigravity-image-gen.json`
**Project**: `<repo>/.pi/extensions/antigravity-image-gen.json`

```json
{
  "save": "global"
}
```

### Save locations

| Mode | Directory |
|------|-----------|
| `none` | Not saved |
| `project` | `<repo>/.pi/generated-images/` |
| `global` | `~/.pi/agent/generated-images/` |
| `custom` | `saveDir` param or `PI_IMAGE_SAVE_DIR` |

## Requirements

- pi v0.50.0 or later
- Google Antigravity OAuth credentials (via `/login`)

## Uninstall

```bash
pi remove npm:@benvargas/pi-antigravity-image-gen
```

## License

MIT
