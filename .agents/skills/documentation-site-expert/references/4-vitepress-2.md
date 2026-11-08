## 4. VitePress 2

### `docs/.vitepress/config.mts`

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Acme Library',
  description: 'A powerful TypeScript utility library.',
  lastUpdated: true,
  cleanUrls: true,
  srcDir: './src',
  outDir: '../dist-docs',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/what-is-acme' },
      { text: 'Reference', link: '/reference/config' },
      {
        text: 'v2.0',
        items: [
          { text: 'v1.x Docs', link: 'https://v1.acme.dev' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Introduction', items: [
          { text: 'What is Acme?', link: '/guide/what-is-acme' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]},
        { text: 'Advanced', items: [
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Plugin API', link: '/guide/plugin-api' },
        ]},
      ],
    },
    editLink: {
      pattern: 'https://github.com/acme/lib/edit/main/docs/src/:path',
      text: 'Edit this page on GitHub',
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/acme/lib' }],
  },

  locales: {
    root: { label: 'English', lang: 'en' },
    id: { label: 'Bahasa Indonesia', lang: 'id', link: '/id/', themeConfig: {
      nav: [{ text: 'Panduan', link: '/id/guide/what-is-acme' }],
    }},
  },
});
```

### Vue 3 Custom Theme Component

```vue
<!-- docs/.vitepress/theme/components/ApiPreview.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ endpoint: string; method?: 'GET' | 'POST' }>();
const response = ref<string | null>(null);

async function runRequest() {
  const res = await fetch(props.endpoint, { method: props.method ?? 'GET' });
  response.value = JSON.stringify(await res.json(), null, 2);
}
</script>

<template>
  <div class="api-preview">
    <div class="controls">
      <span class="method">{{ method ?? 'GET' }}</span>
      <code class="endpoint">{{ endpoint }}</code>
      <button @click="runRequest">Run</button>
    </div>
    <pre v-if="response" class="response">{{ response }}</pre>
  </div>
</template>
```

```typescript
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import ApiPreview from './components/ApiPreview.vue';
import type { Theme } from 'vitepress';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ApiPreview', ApiPreview);
  },
} satisfies Theme;
```

---
