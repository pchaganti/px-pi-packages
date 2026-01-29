# pi-packages

Extensions for [pi](https://github.com/badlogic/pi-mono), the AI coding agent.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [@benvargas/pi-synthetic-provider](./packages/pi-synthetic-provider/) | [Synthetic](https://synthetic.new) model provider | `pi install npm:@benvargas/pi-synthetic-provider` |

## Install (git)

Install all extensions in this repo via git:

```bash
pi install git:github.com/ben-vargas/pi-packages
```

Try without installing:

```bash
pi -e git:github.com/ben-vargas/pi-packages
```

## Development

Each package under `packages/` is an independent pi package with its own `package.json`. There is no shared build system -- each package is self-contained.

### Testing a package locally

```bash
cd packages/pi-synthetic-provider
pi -e .
```

### Publishing

```bash
cd packages/pi-synthetic-provider
npm publish --access public
```

## License

MIT
