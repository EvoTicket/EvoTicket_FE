import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.resolve('./asset');
const OUT_CSS = path.resolve('./src/app/figma-tokens.css');

function readJson(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(ASSETS_DIR, filename), 'utf8'));
    } catch (e) {
        console.warn(`[Cảnh báo] Không tìm thấy file: ${filename}, đã bỏ qua...`);
        return {};
    }
}

const raw = readJson('raw.json');
const semanticLight = readJson('semantic-light.json');
const semanticDark = readJson('semantic-dark.json');
let componentLight = {};
let componentDark = {};

if (fs.existsSync(path.join(ASSETS_DIR, 'component.json'))) {
    const componentSingle = readJson('component.json');
    componentLight = componentSingle;
    componentDark = componentSingle;
    console.log("-> 🔄 Đã đọc file component.json chung và tự động remap alias cho 2 chế độ!");
} else {
    componentLight = readJson('component-light.json');
    componentDark = readJson('component-dark.json');
}

const lightTheme = { ...semanticLight, ...componentLight };
const darkTheme = { ...semanticDark, ...componentDark };

function resolveAlias(aliasPath, currentThemeTree) {
    let cleanPath = aliasPath.replace(/[{}]/g, '');
    const parts = cleanPath.split('.');
    let found = getNestedObject(currentThemeTree, parts) || getNestedObject(raw, parts);
    if (found && found.$value !== undefined) {
        let nextAliasVal = found.$value;
        // Bóc tách alias ẩn đằng sau extensions của Figma nếu có
        if (found.$extensions && found.$extensions["com.figma.aliasData"]) {
            const aliasName = found.$extensions["com.figma.aliasData"].targetVariableName;
            if (aliasName) nextAliasVal = `{${aliasName.replace(/\//g, '.')}}`;
        }

        if (typeof nextAliasVal === 'string' && nextAliasVal.startsWith('{')) {
            return resolveAlias(nextAliasVal, currentThemeTree);
        }
        return found;
    }
    return null;
}

function getNestedObject(obj, parts) {
    let current = obj;
    for (const part of parts) {
        if (current[part] === undefined) return null;
        current = current[part];
    }
    return current;
}

function flattenToCssVars(node, currentThemeTree, prefix = '') {
    let result = {};
    for (const key in node) {
        if (key === "$extensions" || key === "$type") continue;

        let current = node[key];
        const sanitizedKey = key.replace(/\$/g, '');
        const newPrefix = prefix ? `${prefix}-${sanitizedKey}` : sanitizedKey;

        let val = current && current.$value !== undefined ? current.$value : undefined;
        let isAliasFromExtension = false;

        // Ưu tiên đọc biến alias ẩn trong dữ liệu Figma plugin thay vì dùng mã màu cứng
        if (current && current.$extensions && current.$extensions["com.figma.aliasData"]) {
            const aliasName = current.$extensions["com.figma.aliasData"].targetVariableName;
            if (aliasName) {
                val = `{${aliasName.replace(/\//g, '.')}}`;
                isAliasFromExtension = true;
            }
        }

        if (current && (typeof val === 'string' && val.startsWith('{'))) {
            const realNode = resolveAlias(val, currentThemeTree);
            if (realNode && realNode.$value !== undefined) {
                current = { ...current, $value: realNode.$value, $type: realNode.$type || current.$type };
            }
        }

        if (current && current.$value !== undefined) {
            const val = current.$value;
            const type = current.$type;

            if (type === 'color' || (typeof val === 'object' && val.components)) {
                const r = Math.round(val.components[0] * 255);
                const g = Math.round(val.components[1] * 255);
                const b = Math.round(val.components[2] * 255);
                const a = val.alpha !== undefined ? val.alpha : 1;
                const colorPrefix = newPrefix.startsWith('color-') ? newPrefix : `color-${newPrefix}`;
                result[`--${colorPrefix}`] = (a === 1 && val.hex) ? val.hex : `rgba(${r}, ${g}, ${b}, ${a})`;
            } else if (type === 'number' || typeof val === 'number') {
                const isDuration = newPrefix.includes('motion') || newPrefix.includes('duration');
                result[`--${newPrefix}`] = isDuration ? `${val}ms` : `${val}px`;
            } else {
                let isColorString = typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgba') || val.startsWith('rgb'));
                let finalPrefix = (isColorString && !newPrefix.startsWith('color-')) ? `color-${newPrefix}` : newPrefix;
                result[`--${finalPrefix}`] = val;
            }
        } else if (typeof current === 'object') {
            result = { ...result, ...flattenToCssVars(current, currentThemeTree, newPrefix) };
        }
    }
    return result;
}

const lightVars = flattenToCssVars(lightTheme, lightTheme);
const darkVars = flattenToCssVars(darkTheme, darkTheme);

let cssOutput = `/* FILE TỰ ĐỘNG SINH TỪ FIGMA CHO TAILWIND V4 */\n\n@layer base {\n  :root {\n`;
for (const [key, val] of Object.entries(lightVars)) cssOutput += `    ${key}: ${val};\n`;
cssOutput += `  }\n\n  .dark {\n`;
for (const [key, val] of Object.entries(darkVars)) cssOutput += `    ${key}: ${val};\n`;
cssOutput += `  }\n}\n\n/* ---- AUTO MAP SANG TAILWIND CLASSES ---- */\n@theme {\n`;

// Gán biến CSS vào Cây Theme Tailwind V4
for (const key of Object.keys(lightVars)) {
    // Map biến màu sắc
    if (key.startsWith('--color-')) {
        cssOutput += `  ${key}: var(${key});\n`;
    }
    // Map biến không gian (spacing) cho các class p-, m-, gap-, w-, h-
    else if (key.includes('-padding') || key.includes('-gap') || key.includes('-size') || key.includes('-width') || key.includes('-height') || key.startsWith('--space-')) {
        let spacingName = key.replace('--', '');
        if (spacingName.startsWith('space-')) spacingName = spacingName.replace('space-', '');
        cssOutput += `  --spacing-${spacingName}: var(${key});\n`;
    }
    // Map biến bo góc (radius) cho các class rounded-
    else if (key.includes('-radius')) {
        let radiusName = key.replace('--', '');
        cssOutput += `  --radius-${radiusName}: var(${key});\n`;
    }
}
cssOutput += `}\n`;

fs.writeFileSync(OUT_CSS, cssOutput);
console.log('✅ Đã Build thành công file: ' + OUT_CSS);
