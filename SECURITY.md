# Security Notes

## Dependency audit status

This repo currently reports high severity npm audit findings that originate from upstream AWS SDK dependencies pulled in by `@mariozechner/pi-ai` (transitively `@aws-sdk/xml-builder` -> `fast-xml-parser`).

We are not applying overrides in this repo to avoid major dependency changes. The plan is to monitor upstream updates (AWS SDK / pi-ai) and update when fixed versions are released.
