## 1. Mintlify

### `mint.json` — Complete Configuration

```json
{
  "name": "Acme API",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "favicon": "/favicon.svg",
  "colors": {
    "primary": "#0D9373",
    "light": "#07C983",
    "dark": "#0D9373",
    "anchors": { "from": "#0D9373", "to": "#07C983" }
  },
  "topbarLinks": [
    { "name": "Support", "url": "mailto:support@acme.com" }
  ],
  "topbarCtaButton": {
    "name": "Dashboard",
    "url": "https://app.acme.com"
  },
  "tabs": [
    { "name": "API Reference", "url": "api-reference" }
  ],
  "anchors": [
    { "name": "Changelog", "icon": "list", "url": "changelog" },
    { "name": "GitHub", "icon": "github", "url": "https://github.com/acme/api" }
  ],
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "quickstart", "authentication"]
    },
    {
      "group": "Guides",
      "pages": ["guides/webhooks", "guides/pagination", "guides/rate-limits"]
    },
    {
      "group": "API Reference",
      "pages": ["api-reference/introduction", "api-reference/endpoints/users", "api-reference/endpoints/payments"]
    }
  ],
  "openapi": "https://api.acme.com/openapi.json",
  "api": {
    "baseUrl": "https://api.acme.com/v1",
    "auth": {
      "method": "bearer"
    },
    "playground": { "mode": "show" }
  },
  "feedback": { "thumbsRating": true, "suggestEdit": true },
  "search": { "prompt": "Search Acme docs..." },
  "footerSocials": {
    "twitter": "https://twitter.com/acme",
    "github": "https://github.com/acme"
  }
}
```

### MDX Authoring with Custom Components

```mdx
---
title: "Authentication"
description: "Secure your API requests with Bearer tokens."
---

import { Note, Warning, CodeGroup } from 'mintlify/components';

<Note>
  All API requests require an `Authorization: Bearer <token>` header.
</Note>

<Warning>
  Never expose your API secret in client-side code or version control.
</Warning>

## Obtaining an API Key

Navigate to **Settings → API Keys** in your dashboard and click **Create Key**.

<CodeGroup>
```bash cURL
curl https://api.acme.com/v1/users \
  -H "Authorization: Bearer $ACME_API_KEY"
```

```typescript TypeScript
import AcmeClient from '@acme/sdk';

const client = new AcmeClient({ apiKey: process.env.ACME_API_KEY });
const users = await client.users.list();
```
</CodeGroup>
```

### API Playground Auto-Generation from OpenAPI

```bash
# Mintlify CLI — scrape OpenAPI and generate MDX stubs
npm install -g mintlify
mintlify dev             # local preview at http://localhost:3000
mintlify scrape          # auto-generate pages from openapi field in mint.json
```

Mintlify reads the `"openapi"` field in `mint.json` and auto-generates interactive API reference pages with a live request playground, response schema viewer, and try-it UI — zero additional MDX authoring required.

---
