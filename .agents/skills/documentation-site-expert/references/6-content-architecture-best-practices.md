## 6. Content Architecture Best Practices

### Versioning Strategy

| Strategy | When to Use | Tool |
|----------|-------------|------|
| Path-based (`/v1/`, `/v2/`) | REST API with major breaking changes | Mintlify tabs, Docusaurus versions |
| Branch-based | Older maintained releases | `docusaurus docs:version` |
| Monorepo package versioning | Multi-package libs | Changesets + VitePress |
| Date-based | SDKs with frequent patch releases | Changelog + semver badges |

### Changelog Automation with Changesets

```bash
npm install --save-dev @changesets/cli @changesets/changelog-github
npx changeset init

# Add a changeset (run after each PR)
npx changeset add

# Release: bump versions + update CHANGELOG.md
npx changeset version
npx changeset publish
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "acme/lib" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### API Reference via `openapi-typescript`

```bash
npm install --save-dev openapi-typescript typescript

# Generate types from live spec or local file
npx openapi-typescript https://api.acme.com/openapi.json -o src/types/api.d.ts
npx openapi-typescript ./openapi/acme.yaml -o src/types/api.d.ts
```

```typescript
// src/lib/api-client.ts — type-safe API client from generated types
import createClient from 'openapi-fetch';
import type { paths } from '../types/api';

export const apiClient = createClient<paths>({
  baseUrl: 'https://api.acme.com/v1',
  headers: { Authorization: `Bearer ${process.env.API_KEY}` },
});

// Fully typed request — IDE autocomplete for paths, params, and response
const { data, error } = await apiClient.GET('/users/{id}', {
  params: { path: { id: '123' } },
});
```

---
