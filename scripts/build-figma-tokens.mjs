import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, 'design-tokens', 'source');
const GENERATED_DIR = path.join(ROOT_DIR, 'design-tokens', 'generated');
const OUTPUT_CSS = path.join(GENERATED_DIR, 'tokens.css');

const isCheckMode = process.argv.includes('--check');

const CANONICAL_ROOTS = [
  'color',
  'alpha',
  'space',
  'radius',
  'border',
  'motion',
  'font',
  'typography',
  'button',
  'field',
  'input',
  'select',
  'textarea',
  'card',
  'modal',
  'drawer',
  'alert',
  'badge',
  'tab',
  'chip',
  'navbar',
  'seat',
  'status-pill',
  'status',
  'checkbox',
  'radio',
  'switch',
  'popover',
  'tooltip',
  'toast',
  'menu',
  'dropdown',
  'breadcrumb',
  'pagination',
  'table',
  'avatar',
  'divider',
  'skeleton',
  'stepper',
  'accordion',
  'event-card',
  'ticket-card',
  'payment-summary',
  'qr',
  'control',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON(filename, fallback = {}) {
  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function kebab(input) {
  return String(input)
    .trim()
    .replace(/\$/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function normalizeAliasPath(aliasPath) {
  const rawParts = String(aliasPath)
    .replace(/[{}]/g, '')
    .split(/[/.\\]+/g)
    .map(kebab)
    .filter(Boolean);

  const rootIndex = rawParts.findIndex((part) => CANONICAL_ROOTS.includes(part));
  const parts = rootIndex >= 0 ? rawParts.slice(rootIndex) : rawParts;

  return parts.join('-');
}

function aliasToCssVar(aliasPath) {
  const normalized = normalizeAliasPath(aliasPath);
  return `var(--ev-${normalized})`;
}

function resolveAliasString(value) {
  if (typeof value !== 'string') return value;

  return value.replace(/\{([^}]+)\}/g, (_, aliasPath) => {
    return aliasToCssVar(aliasPath);
  });
}

function getFigmaAlias(token) {
  const aliasData =
    token?.$extensions?.['com.figma.aliasData'] ??
    token?.extensions?.['com.figma.aliasData'];

  return aliasData?.targetVariableName ?? null;
}

function getTokenValue(token) {
  const figmaAlias = getFigmaAlias(token);
  if (figmaAlias) return `{${figmaAlias}}`;

  if (hasOwn(token, '$value')) return token.$value;
  if (hasOwn(token, 'value')) return token.value;

  return undefined;
}

function getTokenType(token) {
  return token?.$type ?? token?.type ?? '';
}

function isTokenNode(node) {
  return Boolean(
    node &&
      typeof node === 'object' &&
      !Array.isArray(node) &&
      (hasOwn(node, '$value') || hasOwn(node, 'value') || getFigmaAlias(node))
  );
}

function rgbaFromComponents(value) {
  const comps = value.components;
  if (!Array.isArray(comps) || comps.length < 3) return null;

  const r = Math.round(Number(comps[0]) * 255);
  const g = Math.round(Number(comps[1]) * 255);
  const b = Math.round(Number(comps[2]) * 255);
  const a = value.alpha !== undefined ? Number(value.alpha) : 1;

  if (value.hex && /^#[0-9a-fA-F]{8}$/.test(value.hex)) {
    return value.hex;
  }

  if (value.hex && a === 1) {
    return value.hex;
  }

  return `rgba(${r}, ${g}, ${b}, ${Number.isFinite(a) ? a : 1})`;
}

function shouldUsePx(pathParts, tokenType) {
  const pathStr = pathParts.join('-').toLowerCase();
  const type = String(tokenType).toLowerCase();

  if (
    pathStr.includes('opacity') ||
    pathStr.includes('alpha') ||
    pathStr.includes('font-weight') ||
    pathStr.endsWith('-weight') ||
    type === 'opacity' ||
    type === 'fontweight' ||
    type === 'font-weight'
  ) {
    return false;
  }

  if (
    type === 'dimension' ||
    type === 'sizing' ||
    type === 'spacing' ||
    type === 'borderwidth'
  ) {
    return true;
  }

  return [
    'space',
    'radius',
    'border-width',
    'height',
    'min-height',
    'max-height',
    'width',
    'min-width',
    'max-width',
    'padding',
    'margin',
    'gap',
    'size',
    'font-size',
    'line-height',
    'inset',
    'top',
    'right',
    'bottom',
    'left',
  ].some((keyword) => pathStr.includes(keyword));
}

function shouldUseMs(pathParts, tokenType) {
  const pathStr = pathParts.join('-').toLowerCase();
  const type = String(tokenType).toLowerCase();

  return type === 'duration' || pathStr.includes('duration') || pathStr.includes('motion');
}

function normalizeValue(rawValue, pathParts, tokenType) {
  const aliasResolved = resolveAliasString(rawValue);

  if (typeof aliasResolved === 'string') return aliasResolved;

  if (aliasResolved && typeof aliasResolved === 'object') {
    const rgba = rgbaFromComponents(aliasResolved);
    if (rgba) return rgba;

    if (aliasResolved.hex) return aliasResolved.hex;

    return JSON.stringify(aliasResolved);
  }

  if (typeof aliasResolved === 'number') {
    if (shouldUseMs(pathParts, tokenType)) return `${aliasResolved}ms`;
    if (shouldUsePx(pathParts, tokenType)) return `${aliasResolved}px`;
    return String(aliasResolved);
  }

  return String(aliasResolved);
}

function pathToCssVar(pathParts) {
  return `--ev-${pathParts.map(kebab).join('-')}`;
}

function flattenTokens(obj, pathParts = []) {
  let result = {};

  if (!obj || typeof obj !== 'object') return result;

  for (const [key, node] of Object.entries(obj)) {
    const nextPath = [...pathParts, key];

    if (isTokenNode(node)) {
      const rawValue = getTokenValue(node);
      const tokenType = getTokenType(node);
      const cssVar = pathToCssVar(nextPath);

      result[cssVar] = normalizeValue(rawValue, nextPath.map(kebab), tokenType);
      continue;
    }

    if (node && typeof node === 'object' && !Array.isArray(node)) {
      result = {
        ...result,
        ...flattenTokens(node, nextPath),
      };
    }
  }

  return result;
}

function createCSSBlock(selector, tokens) {
  const entries = Object.entries(tokens);
  if (!entries.length) return '';

  let css = `${selector} {\n`;

  for (const [key, value] of entries) {
    css += `  ${key}: ${value};\n`;
  }

  css += `}\n\n`;
  return css;
}

function isLengthLike(value) {
  return /(?:^|\s)(?:-?\d*\.?\d+)(px|rem|em|%|vh|vw|dvh|dvw|ch|lh|rlh)\b/.test(
    String(value)
  );
}

function isColorValue(value) {
  const v = String(value).trim();

  return (
    /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) ||
    /^rgba?\(/i.test(v) ||
    /^hsla?\(/i.test(v) ||
    /^oklch\(/i.test(v) ||
    /^lab\(/i.test(v) ||
    /^color\(/i.test(v) ||
    v.startsWith('var(--ev-color-') ||
    v.startsWith('var(--ev-alpha-')
  );
}

function isColorLikeToken(key, value) {
  if (key.startsWith('--ev-color-') || key.startsWith('--ev-alpha-')) {
    return true;
  }

  if (!isColorValue(value)) {
    return false;
  }

  const lower = key.toLowerCase();

  if (
    lower.includes('border-width') ||
    lower.includes('-radius') ||
    lower.includes('-height') ||
    lower.includes('-width') ||
    lower.includes('-size') ||
    lower.includes('-padding') ||
    lower.includes('-gap') ||
    lower.includes('-duration') ||
    lower.includes('-opacity')
  ) {
    return false;
  }

  return /-(bg|background|text|border|icon|fill|stroke|shadow|overlay|backdrop)(-|$)/.test(
    lower
  );
}

function isSpacingLikeToken(key, value) {
  if (!isLengthLike(value)) return false;

  const lower = key.toLowerCase();

  return /-(padding|margin|gap|height|min-height|max-height|width|min-width|max-width|size|inset|top|right|bottom|left)(-|$)/.test(
    lower
  );
}

function isComponentRadiusToken(key, value) {
  return key.includes('-radius') && !key.startsWith('--ev-radius-') && isLengthLike(value);
}

function generateTypographyThemeLines(typographyObj) {
  let css = '';

  if (!typographyObj || typeof typographyObj !== 'object') return css;

  const walk = (node, pathParts = []) => {
    if (!node || typeof node !== 'object') return;

    const fontSize = node.fontSize ?? node['font-size'] ?? node.font_size;
    const lineHeight = node.lineHeight ?? node['line-height'] ?? node.line_height;
    const fontWeight = node.fontWeight ?? node['font-weight'] ?? node.font_weight;

    if (fontSize !== undefined) {
      const name = pathParts.map(kebab).join('-');

      css += `  --text-${name}: ${normalizeTypographyValue(fontSize, 'fontSize')};\n`;

      if (lineHeight !== undefined) {
        css += `  --text-${name}--line-height: ${normalizeTypographyValue(
          lineHeight,
          'lineHeight'
        )};\n`;
      }

      if (fontWeight !== undefined) {
        css += `  --text-${name}--font-weight: ${normalizeTypographyValue(
          fontWeight,
          'fontWeight'
        )};\n`;
      }

      return;
    }

    for (const [key, child] of Object.entries(node)) {
      walk(child, [...pathParts, key]);
    }
  };

  walk(typographyObj);
  return css;
}

function normalizeTypographyValue(value, prop) {
  if (value && typeof value === 'object' && (hasOwn(value, '$value') || hasOwn(value, 'value'))) {
    value = hasOwn(value, '$value') ? value.$value : value.value;
  }

  if (typeof value === 'number') {
    if (prop === 'fontWeight') return String(value);
    return `${value}px`;
  }

  return String(value);
}

function generateTailwindTheme(allTokens, typographyObj) {
  let css = '@theme {\n';
  const emitted = new Set();

  const emit = (themeVar, tokenVar) => {
    if (emitted.has(themeVar)) return;

    emitted.add(themeVar);
    css += `  ${themeVar}: var(${tokenVar});\n`;
  };

  for (const [key, value] of Object.entries(allTokens)) {
    /**
     * Color utilities:
     * - --ev-color-bg-page              -> --color-bg-page
     * - --ev-button-primary-bg-default  -> --color-button-primary-bg-default
     */
    if (isColorLikeToken(key, value)) {
      emit(key.replace('--ev-', '--color-'), key);
      continue;
    }

    /**
     * Primitive spacing:
     * IMPORTANT:
     * Do NOT generate --spacing-xl, --spacing-lg...
     * because that overrides Tailwind default utilities such as max-w-xl.
     *
     * Instead:
     * --ev-space-xl -> --spacing-ds-xl
     */
    if (key.startsWith('--ev-space-')) {
      const suffix = key.replace('--ev-space-', '');
      emit(`--spacing-ds-${suffix}`, key);
      continue;
    }

    /**
     * Primitive radius:
     * IMPORTANT:
     * Do NOT generate --radius-lg, --radius-xl...
     * because that changes old rounded-ds-lg/rounded-ds-xl behavior.
     *
     * Instead:
     * --ev-radius-xl -> --radius-ds-xl
     */
    if (key.startsWith('--ev-radius-')) {
      const suffix = key.replace('--ev-radius-', '');
      emit(`--radius-ds-${suffix}`, key);
      continue;
    }

    /**
     * Component size tokens:
     * - --ev-button-height-md     -> --spacing-button-height-md
     * - --ev-button-padding-x-md  -> --spacing-button-padding-x-md
     *
     * These names do not collide with Tailwind defaults.
     */
    if (isSpacingLikeToken(key, value)) {
      const suffix = key.replace('--ev-', '');
      emit(`--spacing-${suffix}`, key);
      continue;
    }

    /**
     * Component radius tokens:
     * - --ev-button-radius -> --radius-button
     * - --ev-card-radius   -> --radius-card
     */
    if (isComponentRadiusToken(key, value)) {
      const suffix = key.replace('--ev-', '').replace(/-radius$/, '');
      emit(`--radius-${suffix}`, key);
    }
  }

  css += generateTypographyThemeLines(typographyObj);
  css += '}\n\n';

  return css;
}

function generateCompatibilityAliases(allTokens) {
  let css =
    '/* Legacy compatibility aliases. Prefer --ev-* variables or Tailwind token utilities in new code. */\n:root {\n';

  const emitted = new Set();

  const emit = (alias, target) => {
    if (emitted.has(alias)) return;

    emitted.add(alias);
    css += `  ${alias}: var(${target});\n`;
  };

  for (const key of Object.keys(allTokens)) {
    /**
     * IMPORTANT:
     * Do NOT emit aliases like:
     *   --radius-lg: var(--ev-radius-lg);
     *   --radius-xl: var(--ev-radius-xl);
     *
     * Tailwind v4 uses --radius-* internally for utilities such as rounded-ds-lg.
     * If we redefine those variables, old UI changes shape globally.
     *
     * Use:
     *   --ev-radius-lg
     *   --radius-ds-lg
     * instead.
     */
    if (key.startsWith('--ev-radius-')) {
      continue;
    }

    /**
     * IMPORTANT:
     * Do NOT emit aliases like:
     *   --spacing-xl: var(--ev-space-xl);
     *
     * This was the root cause of max-w-xl becoming 20px.
     * We also avoid emitting any risky spacing aliases here.
     *
     * Use:
     *   --ev-space-xl
     *   --spacing-ds-xl
     * instead.
     */
    if (key.startsWith('--ev-space-')) {
      continue;
    }

    /**
     * General legacy alias:
     * --ev-color-bg-page -> --color-bg-page
     * --ev-button-primary-bg-default -> --button-primary-bg-default
     */
    emit(key.replace('--ev-', '--'), key);

    /**
     * Extra color aliases for old code that used --color-* directly.
     */
    if (key.startsWith('--ev-color-')) {
      emit(key.replace('--ev-color-', '--color-'), key);
    }

    if (key.startsWith('--ev-alpha-')) {
      emit(key.replace('--ev-alpha-', '--alpha-'), key);
    }
  }

  css += '}\n\n';
  return css;
}
function assertGeneratedCSS(css) {
  const forbidden = [
    '--spacing-xs:',
    '--spacing-sm:',
    '--spacing-md:',
    '--spacing-lg:',
    '--spacing-xl:',
    '--spacing-2xl:',
    '--radius-xs:',
    '--radius-sm:',
    '--radius-md:',
    '--radius-lg:',
    '--radius-xl:',
    '--radius-2xl:',
  ];

  const violations = forbidden.filter((needle) => css.includes(needle));

  if (violations.length) {
    throw new Error(
      `Generated CSS overrides Tailwind defaults: ${violations.join(', ')}. ` +
        'Use ds-prefixed spacing/radius tokens instead.'
    );
  }
}

async function main() {
  ensureDir(GENERATED_DIR);

  const primitiveObj = readJSON('primitive.json');
  const semanticLightObj = readJSON('semantic.light.json');
  const semanticDarkObj = readJSON('semantic.dark.json');
  const componentObj = readJSON('component.json');
  const typographyObj = readJSON('typography.json');

  const primitiveTokens = flattenTokens(primitiveObj);
  const semanticLightTokens = flattenTokens(semanticLightObj);
  const semanticDarkTokens = flattenTokens(semanticDarkObj);
  const componentTokens = flattenTokens(componentObj);

  const allLightTokens = {
    ...primitiveTokens,
    ...semanticLightTokens,
    ...componentTokens,
  };

  let outputCSS = `/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
   Source: design-tokens/source/*
   Build: npm run tokens:build
*/\n\n`;

  outputCSS += '/* Primitive tokens: no light/dark mode. */\n';
  outputCSS += createCSSBlock(':root', primitiveTokens);

  outputCSS += '/* Semantic tokens: light mode. */\n';
  outputCSS += createCSSBlock(':root', semanticLightTokens);

  outputCSS += '/* Semantic tokens: dark mode. */\n';
  outputCSS += createCSSBlock('.dark', semanticDarkTokens);

  outputCSS += '/* Component tokens: base aliases, no light/dark mode. */\n';
  outputCSS += createCSSBlock(':root', componentTokens);

  outputCSS += generateCompatibilityAliases(allLightTokens);
  outputCSS += generateTailwindTheme(allLightTokens, typographyObj);

  assertGeneratedCSS(outputCSS);

  if (isCheckMode) {
    const existing = fs.existsSync(OUTPUT_CSS) ? fs.readFileSync(OUTPUT_CSS, 'utf-8') : '';

    if (existing !== outputCSS) {
      console.error('Tokens are out of sync. Please run `npm run tokens:build`.');
      process.exit(1);
    }

    console.log('Tokens are up to date.');
    return;
  }

  fs.writeFileSync(OUTPUT_CSS, outputCSS, 'utf-8');

  console.log(`Tokens successfully built to ${path.relative(ROOT_DIR, OUTPUT_CSS)}`);
  console.log(
    'Tailwind default spacing/radius namespaces were preserved. Use p-ds-*, gap-ds-*, rounded-ds-* for Figma design tokens.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});