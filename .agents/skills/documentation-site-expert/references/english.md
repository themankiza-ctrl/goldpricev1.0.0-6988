## English

### Orchestration & Integration
- **`modern-web-guidance`**: HTML5/CSS standards, modern browser APIs, and accessibility guidelines.
- **`design-system-architect`**: Component documentation, design token references, and Storybook integration.
- **`ui-ux-pro-max`**: Documentation typography hierarchy, syntax themes, and search UX.
- **`visual-ui-auditor`**: Multimodal vision auditing of component documentation previews and Storybook.
- **`anti-slop`**: Anti-slop technical documentation, zero marketing buzzwords, concrete code samples.
- **`openapi-swagger-codegen-expert`**: Auto-generate API reference pages from OpenAPI 3.1 specs.
- **`astro-framework-expert`**: Astro Starlight as a full-featured docs site platform.
- **`seo`**: Documentation SEO — canonical URLs, sitemap.xml, structured data, and GEO.
- **`ci-cd-devops-architect`**: Automated deployment pipelines to Vercel, Cloudflare Pages, GitHub Pages.
- **`senior-frontend`**: Custom MDX components, interactive playgrounds, and React-based doc UIs.
- **`search-engine-expert`**: Algolia DocSearch, Pagefind, and Typesense integration for doc search.
- **`global-a11y-i18n-expert`**: i18n multi-language documentation and WCAG-compliant doc sites.

### Description
Expert guide for building production-grade technical documentation sites and component libraries. Covers **Mintlify** (AI-native SaaS docs), **Docusaurus 3** (React/OSS), **Storybook 8** (component playground), **VitePress 2** (Vue-powered), and **Astro Starlight** (content-heavy i18n). Includes API reference generation, versioning strategies, search integration, Chromatic visual testing, and CI/CD deployment workflows.

### Trigger Conditions
- Creating documentation sites for APIs, libraries, or SaaS products.
- Setting up Storybook for component documentation and visual regression.
- Choosing a documentation framework for an open-source project.
- Generating API reference docs from OpenAPI specs.
- Migrating from legacy docs (GitBook, Confluence, readme.io) to modern static sites.
- Adding versioning, search, or i18n to an existing documentation site.

---

### Framework Selection Matrix

| Framework      | Stack        | AI Search    | Versioning | i18n | Best For                         |
|----------------|--------------|--------------|------------|------|----------------------------------|
| Mintlify       | React / MDX  | ✅ AI Native  | ✅          | ✅   | SaaS API docs, commercial products |
| Docusaurus 3   | React / MDX  | ✅ Algolia    | ✅          | ✅   | Open-source projects             |
| Storybook 8    | Any framework| ❌            | ❌          | ❌   | UI component library playground  |
| VitePress 2    | Vue / MD     | ✅ Built-in   | ❌          | ✅   | Vue ecosystem / library docs     |
| Astro Starlight| Astro / MDX  | ✅ Pagefind   | ✅          | ✅   | Content-heavy multi-lang docs    |

**Decision Rule:**
- SaaS product → **Mintlify** (zero-config, AI search, API playground)
- OSS library → **Docusaurus** (versioning + Algolia + community plugins)
- Component library → **Storybook** (visual testing + interactions + Chromatic)
- Vue project → **VitePress** (native Vue integration, blazing fast)
- Content-heavy / i18n-first → **Astro Starlight** (Pagefind, i18n routing)

---
