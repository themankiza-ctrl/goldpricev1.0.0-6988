## 5. Astro Starlight

### Installation & Sidebar Config

```bash
npm create astro@latest -- --template starlight
```

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Acme Docs',
      logo: { src: './src/assets/logo.svg' },
      social: { github: 'https://github.com/acme/acme' },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        id: { label: 'Bahasa Indonesia', lang: 'id' },
        ja: { label: '日本語', lang: 'ja' },
      },
      sidebar: [
        { label: 'Start Here', items: [
          { label: 'Introduction', link: '/intro/' },
          { label: 'Installation', link: '/install/' },
        ]},
        { label: 'Guides', autogenerate: { directory: 'guides' } },
        { label: 'Reference', autogenerate: { directory: 'reference' } },
      ],
      editLink: { baseUrl: 'https://github.com/acme/docs/edit/main/' },
      lastUpdated: true,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      customCss: ['./src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/CustomSiteTitle.astro',
      },
    }),
  ],
});
```

### Pagefind Search Configuration

Starlight ships with **Pagefind** out of the box — zero config needed. Pagefind runs at build time and creates a client-side search index from your HTML output.

```bash
# Build triggers Pagefind indexing automatically
npm run build

# Pagefind index output: dist/pagefind/
# Bundle size: ~8 KB JS + compressed index shards
```

### i18n MDX Page Structure

```
src/content/docs/
├── intro.mdx              ← English (root locale)
├── install.mdx
├── guides/
│   └── quickstart.mdx
└── id/                    ← Bahasa Indonesia
    ├── intro.mdx
    ├── install.mdx
    └── guides/
        └── quickstart.mdx
```

```mdx
---
# src/content/docs/id/intro.mdx
title: Pengantar
description: Selamat datang di dokumentasi Acme.
---

Acme adalah library TypeScript berkinerja tinggi untuk membangun pipeline data modern.

## Fitur Utama

- ⚡ **Performa tinggi** — dioptimalkan untuk throughput jutaan record per detik
- 🔒 **Type-safe** — dibangun dengan TypeScript strict mode
- 🧩 **Modular** — gunakan hanya modul yang Anda butuhkan
```

---
