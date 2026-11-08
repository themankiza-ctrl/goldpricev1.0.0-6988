## 2. Docusaurus 3

### `docusaurus.config.ts` — Production-Ready Example

```typescript
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Acme Docs',
  tagline: 'The fastest way to build on Acme',
  favicon: 'img/favicon.ico',
  url: 'https://docs.acme.com',
  baseUrl: '/',
  organizationName: 'acme',
  projectName: 'acme-docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id', 'ja'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/acme/docs/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          versions: {
            current: { label: 'v3 (Next)', path: 'next', banner: 'unreleased' },
          },
          lastVersion: 'v2',
        },
        blog: {
          showReadingTime: true,
          feedOptions: { type: ['rss', 'atom'], xslt: true },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: { changefreq: 'weekly', priority: 0.5 },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          acme: {
            specPath: 'openapi/acme.yaml',
            outputDir: 'docs/api',
            sidebarOptions: { groupPathsBy: 'tag', categoryLinkSource: 'tag' },
          },
        },
      },
    ],
    ['@docusaurus/plugin-ideal-image', { max: 1030, min: 640, steps: 2 }],
  ],
  themeConfig: {
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'acme_docs',
      contextualSearch: true,
      searchPagePath: 'search',
    },
    prism: {
      theme: { plain: {}, styles: [] },
      additionalLanguages: ['bash', 'json', 'yaml', 'typescript'],
    },
    navbar: {
      title: 'Acme',
      logo: { alt: 'Acme Logo', src: 'img/logo.svg' },
      items: [
        { type: 'docsVersionDropdown', position: 'left' },
        { type: 'localeDropdown', position: 'right' },
        { href: 'https://github.com/acme/docs', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Docs', items: [{ label: 'Getting Started', to: '/docs/intro' }] },
        { title: 'Community', items: [{ label: 'Discord', href: 'https://discord.gg/acme' }] },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Acme, Inc.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
```

### Versioning Strategy

```bash
# Create a new versioned snapshot (freezes current /docs)
npm run docusaurus docs:version 2.0.0

# Resulting structure:
# versioned_docs/version-2.0.0/   ← frozen snapshot
# versioned_sidebars/version-2.0.0-sidebars.json
# versions.json                   ← ["2.0.0"]
# docs/                           ← "next" (unreleased)
```

### Algolia DocSearch Integration

```bash
# Request free DocSearch tier at: https://docsearch.algolia.com/apply
# Then install crawler config:
npm install @algolia/client-search
```

```javascript
// algolia-crawler-config.js (submitted to Algolia dashboard)
new Crawler({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_WRITE_API_KEY',
  rateLimit: 8,
  startUrls: ['https://docs.acme.com/'],
  renderJavaScript: false,
  sitemaps: ['https://docs.acme.com/sitemap.xml'],
  ignoreCanonicalTo: true,
  discoveryPatterns: ['https://docs.acme.com/**'],
  actions: [{
    indexName: 'acme_docs',
    pathsToMatch: ['https://docs.acme.com/**'],
    recordExtractor: ({ $, helpers }) => {
      return helpers.docsearch({
        recordProps: {
          lvl1: ['header h1', 'article h1', 'main h1'],
          content: ['article p, article li', 'main p, main li'],
        },
        indexHeadings: true,
      });
    },
  }],
  initialIndexSettings: {
    acme_docs: {
      attributesForFaceting: ['type', 'lang', 'version'],
      attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url'],
      attributesToHighlight: ['hierarchy', 'content'],
      attributesToSnippet: ['content:10'],
      searchableAttributes: ['unordered(hierarchy.lvl0)', 'content'],
      distinct: true,
      attributeForDistinct: 'url',
      ranking: ['words', 'filters', 'typo', 'attribute', 'proximity', 'exact', 'custom'],
    },
  },
});
```

### MDX Plugins

```bash
npm install remark-math rehype-katex remark-gfm rehype-mermaid
```

```typescript
// docusaurus.config.ts — add to docs preset options:
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// inside docs preset:
remarkPlugins: [remarkMath],
rehypePlugins: [rehypeKatex],
```

---
