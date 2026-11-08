## 7. Deployment

### Vercel (Recommended for Mintlify + Docusaurus + VitePress)

```json
// vercel.json — Docusaurus / VitePress
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/$1" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Cloudflare Pages

```yaml
# Build settings (Cloudflare Dashboard → Pages → Build & deployments)
# Build command:  npm run build
# Output dir:     build        (Docusaurus) | dist (VitePress/Starlight)
# Node.js:        22.x
```

```toml
# wrangler.toml — for Workers + Pages hybrid
name = "acme-docs"
compatibility_date = "2026-01-01"

[site]
bucket = "./build"
```

### GitHub Pages Workflow

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: build }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---
