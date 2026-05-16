import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), 'design-tokens', 'source');
const GENERATED_DIR = path.join(process.cwd(), 'design-tokens', 'generated');
const OUTPUT_CSS = path.join(GENERATED_DIR, 'tokens.css');

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const isCheckMode = process.argv.includes('--check');

function readJSON(filename) {
  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function resolveAlias(value) {
  if (typeof value !== 'string') return value;
  const aliasRegex = /\{([^}]+)\}/g;
  return value.replace(aliasRegex, (match, inner) => {
    const normalizedInner = inner.replace(/\//g, '.');
    return `var(--ev-${normalizedInner.replace(/\./g, '-')})`;
  });
}

function normalizeValue(value, keyPath) {
  if (value && typeof value === 'object') {
    if (value.components) {
      const r = Math.round(value.components[0] * 255);
      const g = Math.round(value.components[1] * 255);
      const b = Math.round(value.components[2] * 255);
      const a = value.alpha !== undefined ? value.alpha : 1;
      
      // Keep 8-digit hex if available (e.g. #00000099)
      if (value.hex && value.hex.length === 9) {
        return value.hex;
      }
      
      if (a === 1 && value.hex) {
        return value.hex;
      }
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (value.hex) {
      return value.hex;
    }
    return JSON.stringify(value);
  }

  const pathStr = keyPath.join('-');
  if (typeof value === 'number') {
    if (
      pathStr.includes('space') || 
      pathStr.includes('radius') || 
      pathStr.includes('border') || 
      pathStr.includes('height') || 
      pathStr.includes('padding') || 
      pathStr.includes('font-size') || 
      pathStr.includes('line-height') ||
      pathStr.includes('size') ||
      pathStr.includes('width') ||
      pathStr.includes('gap')
    ) {
      if (!pathStr.includes('opacity') && !pathStr.includes('alpha')) {
        return `${value}px`;
      }
    }
    
    if (pathStr.includes('motion') || pathStr.includes('duration')) {
      return `${value}ms`;
    }
  }

  return value;
}

function flattenTokens(obj, prefix = '') {
  let result = {};

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const hasValue = obj[key].value !== undefined || obj[key].$value !== undefined;
      // Must have value AND type to be a valid token (avoids treating 'value' groups as tokens)
      const hasType = obj[key].type !== undefined || obj[key].$type !== undefined;
      const isToken = hasValue && hasType;
      
      if (isToken) {
        let rawValue = obj[key].value !== undefined ? obj[key].value : obj[key].$value;
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const cssVar = `--ev-${fullPath.replace(/\./g, '-').replace(/\$/g, '')}`;
        
        // Prioritize Figma's hidden aliasData over hex value
        if (obj[key].$extensions && obj[key].$extensions["com.figma.aliasData"]) {
          const aliasName = obj[key].$extensions["com.figma.aliasData"].targetVariableName;
          if (aliasName) {
            rawValue = `{${aliasName.replace(/\//g, '.')}}`;
          }
        }
        
        let val = resolveAlias(rawValue);
        val = normalizeValue(val, fullPath.split('.'));
        
        result[cssVar] = val;
      } else {
        const nestedPrefix = prefix ? `${prefix}.${key}` : key;
        const flattened = flattenTokens(obj[key], nestedPrefix);
        result = { ...result, ...flattened };
      }
    }
  }
  return result;
}

function createCSSBlock(selector, tokens) {
  let css = `${selector} {\n`;
  for (const [key, value] of Object.entries(tokens)) {
    css += `  ${key}: ${value};\n`;
  }
  css += `}\n\n`;
  return css;
}

function generateTypographyTailwind(typographyObj) {
  let css = '';
  if (!typographyObj) return css;

  const flattenTypography = (obj, prefix = '') => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key].fontSize !== undefined) {
        const name = prefix ? `${prefix}-${key}` : key;
        css += `  --text-${name}: ${obj[key].fontSize}px;\n`;
        if (obj[key].lineHeight) {
          css += `  --text-${name}--line-height: ${obj[key].lineHeight}px;\n`;
        }
        if (obj[key].fontWeight) {
          css += `  --text-${name}--font-weight: ${obj[key].fontWeight};\n`;
        }
      } else {
        flattenTypography(obj[key], prefix ? `${prefix}-${key}` : key);
      }
    }
  };

  flattenTypography(typographyObj);
  return css;
}

function generateTailwindTheme(allTokens) {
  let css = `@theme {\n`;
  
  for (const key of Object.keys(allTokens)) {
    if (key.startsWith('--ev-color-')) {
      css += `  ${key.replace('--ev-color-', '--color-')}: var(${key});\n`;
    } 
    else if (key.includes('-bg-') || key.includes('-text-') || key.includes('-border-') || key.includes('-icon-') || key.includes('-fill-') || key.includes('-stroke-')) {
      // Components colors e.g. --ev-button-primary-bg-default
      css += `  ${key.replace('--ev-', '--color-')}: var(${key});\n`;
    }
    else if (key.startsWith('--ev-space-')) {
      css += `  ${key.replace('--ev-space-', '--spacing-')}: var(${key});\n`;
    }
    else if (key.startsWith('--ev-radius-')) {
      css += `  ${key.replace('--ev-', '--')}: var(${key});\n`;
    }
    else if (key.includes('-padding') || key.includes('-gap') || key.includes('-size') || key.includes('-width') || key.includes('-height')) {
      css += `  ${key.replace('--ev-', '--spacing-')}: var(${key});\n`;
    }
  }
  return css;
}

function generateCompatibilityAliases(allTokens) {
  let css = `/* Legacy compatibility aliases for source components */\n:root {\n`;
  for (const key of Object.keys(allTokens)) {
    // Generate an alias without the --ev- prefix
    const oldKey = key.replace('--ev-', '--');
    // For --ev-color-* we also generate --color-* because that's what the old tokens might have been
    css += `  ${oldKey}: var(${key});\n`;
    
    // Also handle cases where old code used --color-bg-page directly instead of --ev-color-bg-page
    if (key.startsWith('--ev-color-')) {
      const colorKey = key.replace('--ev-color-', '--color-');
      if (colorKey !== oldKey) {
         css += `  ${colorKey}: var(${key});\n`;
      }
    }
  }
  css += `}\n\n`;
  return css;
}

async function main() {
  console.log('Building Figma tokens...');

  const primitiveObj = readJSON('primitive.json') || {};
  const semanticLightObj = readJSON('semantic.light.json') || {};
  const semanticDarkObj = readJSON('semantic.dark.json') || {};
  const componentObj = readJSON('component.json') || {};
  const typographyObj = readJSON('typography.json') || {};

  const primitiveTokens = flattenTokens(primitiveObj);
  const semanticLightTokens = flattenTokens(semanticLightObj);
  const semanticDarkTokens = flattenTokens(semanticDarkObj);
  const componentTokens = flattenTokens(componentObj);
  
  const allTokensForTheme = { ...primitiveTokens, ...semanticLightTokens, ...componentTokens };

  let outputCSS = `/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
   Source: design-tokens/source/*
   Build: npm run tokens:build
*/\n\n`;

  outputCSS += createCSSBlock(':root', primitiveTokens);
  outputCSS += createCSSBlock(':root', semanticLightTokens);
  outputCSS += createCSSBlock('.dark', semanticDarkTokens);
  outputCSS += createCSSBlock(':root', componentTokens);

  outputCSS += generateCompatibilityAliases(allTokensForTheme);
  
  outputCSS += generateTailwindTheme(allTokensForTheme);
  outputCSS += generateTypographyTailwind(typographyObj);
  outputCSS += `}\n`; // Close @theme block

  if (isCheckMode) {
    const existing = fs.existsSync(OUTPUT_CSS) ? fs.readFileSync(OUTPUT_CSS, 'utf-8') : '';
    if (existing !== outputCSS) {
      console.error('Tokens are out of sync. Please run `npm run tokens:build`');
      process.exit(1);
    }
    console.log('Tokens are up to date.');
  } else {
    fs.writeFileSync(OUTPUT_CSS, outputCSS);
    console.log(`Tokens successfully built to ${OUTPUT_CSS}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
