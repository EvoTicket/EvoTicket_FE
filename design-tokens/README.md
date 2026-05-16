# EvoTicket Design Tokens

This directory contains the source of truth for all design tokens used in the EvoTicket frontend.

## Architecture

Our tokens are structured into three main layers:
1. **Primitive (`primitive.json`)**: Core color palettes, raw values (spaces, radius, etc.). *No Light/Dark mode.*
2. **Semantic (`semantic.light.json`, `semantic.dark.json`)**: Meaningful aliases mapping to primitives (e.g., `bg-surface`, `text-primary`). *This is the only layer that defines Light/Dark mode variants.*
3. **Component (`component.json`)**: Component-specific overrides and aliases (e.g., `button-primary-bg`). *No Light/Dark mode.*
4. **Typography (`typography.json`)**: Text styles containing font sizes, line heights, and weights.

## How to Build

Anytime you update the JSON files in `source/` or receive new exports from Figma, you must rebuild the CSS tokens:

```bash
npm run tokens:build
```

This script (`scripts/build-figma-tokens.mjs`) reads the JSON files, flattens them, resolves aliases, appends proper CSS units, and generates `generated/tokens.css`.

## Usage in Code

The generated tokens are imported in `app/globals.css`. It automatically creates CSS variables prefixed with `--ev-` and integrates them into Tailwind CSS via the `@theme` directive.

Instead of hardcoding hex values, always use Tailwind utilities generated from the design tokens.
For example, instead of `bg-[#FAFBFC]`, use `bg-bg-surface` or `bg-neutral-50`.

```tsx
// ✅ Correct
<div className="bg-bg-page text-text-primary p-lg rounded-ds-xl border border-border-default">
  <h1 className="text-heading-h2 font-semibold">Title</h1>
</div>

// ❌ Incorrect
<div className="bg-[#FFFFFF] text-[#121826] p-4 rounded-ds-xl border border-[#D3DAE6]">
  <h1 className="text-[36px] font-semibold">Title</h1>
</div>
```

### Compatibility Layer
For backward compatibility, legacy CSS variables (e.g., `--bg-main`, `--color-primary`) have been mapped to their new `--ev-` counterparts in `globals.css`. When writing new components, avoid using the legacy CSS variables directly; use the new Tailwind utility classes or the `--ev-` CSS variables instead.
