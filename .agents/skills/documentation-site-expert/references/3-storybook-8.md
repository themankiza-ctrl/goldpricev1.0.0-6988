## 3. Storybook 8

### Installation & Autodocs

```bash
# Initialize Storybook in an existing project
npx storybook@latest init

# Start dev server
npm run storybook

# Build static site
npm run build-storybook
```

### Story with Interaction Testing

```typescript
// src/components/Button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', size: 'md', children: 'Click me' },
};

export const InteractionTest: Story = {
  args: { variant: 'primary', children: 'Submit' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};
```

### `.storybook/main.ts` — Addon Ecosystem

```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',      // Controls, Docs, Actions, Viewport, Backgrounds
    '@storybook/addon-interactions',    // play() function testing
    '@storybook/addon-a11y',            // Axe-core accessibility audit
    '@chromatic-com/storybook',         // Chromatic visual testing
    '@storybook/addon-themes',          // Light/Dark theme switching
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: { autodocs: 'tag' },
  staticDirs: ['../public'],
};

export default config;
```

### Chromatic Visual Testing

```bash
npm install --save-dev chromatic

# Run visual regression against baseline
npx chromatic --project-token=<your-token>

# CI flag — accept changes automatically on main branch
npx chromatic --project-token=<your-token> --auto-accept-changes main
```

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: push
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - name: Run Chromatic
        uses: chromaui/action@v11
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true
```

---
