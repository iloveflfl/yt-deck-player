#!/usr/bin/env node
/*
 * npm run check — lightweight project sanity checks (no dependencies):
 *  1. JS syntax of main/preload/renderer (node --check)
 *  2. Required files exist
 *  3. Theme registry consistency:
 *     - THEMES entries have required keys
 *     - THEME_ORDER is derived from THEMES (or, if explicit, matches it)
 *     - art assets referenced by themes exist
 *     - every body[data-theme="..."] block in styles.css targets a known theme
 *  4. i18n integrity: ko/en key parity, data-i18n attributes resolve
 *  5. Asset references in styles.css exist
 *  6. Version consistency between package.json and the index.html version pill
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failures = 0;
const ok = (msg) => console.log('  ok   ' + msg);
const fail = (msg) => { failures += 1; console.error('  FAIL ' + msg); };

console.log('[1/6] JS syntax');
for (const rel of ['src/main.js', 'src/preload.js', 'src/renderer.js', 'scripts/check.js']) {
  try {
    execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
    ok(rel);
  } catch (err) {
    fail(`${rel}: ${String(err.stderr || err.message).trim().split('\n')[0]}`);
  }
}

console.log('[2/6] required files');
const requiredFiles = [
  'package.json',
  'src/index.html',
  'src/styles.css',
  'src/main.js',
  'src/preload.js',
  'src/renderer.js',
  'src/appbar-helper.ps1',
  'src/assets/app-icon.png',
  'build/icon.ico',
];
for (const rel of requiredFiles) {
  if (fs.existsSync(path.join(root, rel))) ok(rel);
  else fail(`missing file: ${rel}`);
}

console.log('[3/6] theme registry');
const rendererSrc = fs.readFileSync(path.join(root, 'src/renderer.js'), 'utf8');
const stylesSrc = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');

const themesBlockMatch = rendererSrc.match(/const THEMES = \{([\s\S]*?)\n\};/);
if (!themesBlockMatch) {
  fail('could not locate `const THEMES = { ... };` in src/renderer.js');
} else {
  const block = themesBlockMatch[1];
  const themeKeys = [];
  const entryRe = /^\s*([A-Za-z0-9_]+):\s*\{(.*)\}/gm;
  const requiredProps = ['name', 'bg0', 'bg1', 'panel', 'panel2', 'text', 'muted', 'accent', 'accent2'];
  let m;
  while ((m = entryRe.exec(block)) !== null) {
    const [, key, body] = m;
    themeKeys.push(key);
    for (const prop of requiredProps) {
      if (!new RegExp(`\\b${prop}\\s*:`).test(body)) fail(`theme "${key}" is missing required key "${prop}"`);
    }
    const artMatch = body.match(/\bart:\s*'([^']+)'/);
    if (artMatch && !fs.existsSync(path.join(root, 'src', artMatch[1]))) {
      fail(`theme "${key}" references missing art asset: src/${artMatch[1]}`);
    }
  }
  if (themeKeys.length === 0) fail('no theme entries found inside THEMES');
  else ok(`${themeKeys.length} themes parsed: ${themeKeys.join(', ')}`);
  if (themeKeys.includes('adaptive')) fail('"adaptive" must not be a THEMES entry (it is appended to THEME_ORDER automatically)');

  if (/const THEME_ORDER = \[\.\.\.Object\.keys\(THEMES\), 'adaptive'\];/.test(rendererSrc)) {
    ok('THEME_ORDER is derived from THEMES (cannot drift)');
  } else {
    const orderMatch = rendererSrc.match(/const THEME_ORDER = \[([^\]]*)\]/);
    if (!orderMatch) {
      fail('could not locate THEME_ORDER in src/renderer.js');
    } else {
      const order = [...orderMatch[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      for (const key of themeKeys) if (!order.includes(key)) fail(`THEME_ORDER is missing theme "${key}"`);
      for (const key of order) if (key !== 'adaptive' && !themeKeys.includes(key)) fail(`THEME_ORDER references unknown theme "${key}"`);
      if (!order.includes('adaptive')) fail('THEME_ORDER must include "adaptive"');
    }
  }

  const cssThemeRefs = new Set([...stylesSrc.matchAll(/data-theme="([A-Za-z0-9_]+)"/g)].map((x) => x[1]));
  for (const key of cssThemeRefs) {
    if (!themeKeys.includes(key)) fail(`styles.css targets unknown theme key "${key}" (body[data-theme="${key}"])`);
  }
  ok(`styles.css per-theme blocks all target known themes (${cssThemeRefs.size} keys)`);
}

console.log('[4/6] i18n integrity');
const indexSrc = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');

function extractBraceBlock(source, marker) {
  const idx = source.indexOf(marker);
  if (idx < 0) return null;
  const start = source.indexOf('{', idx);
  if (start < 0) return null;
  let depth = 0;
  let inString = null;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') i += 1;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

const i18nBlock = extractBraceBlock(rendererSrc, 'const I18N = ');
if (!i18nBlock) {
  fail('could not locate `const I18N = { ... }` in src/renderer.js');
} else {
  const langKeys = {};
  for (const lang of ['ko', 'en']) {
    const langBlock = extractBraceBlock(i18nBlock, `${lang}: `);
    if (!langBlock) { fail(`I18N is missing language "${lang}"`); continue; }
    langKeys[lang] = new Set([...langBlock.matchAll(/^\s*([A-Za-z0-9_]+):/gm)].map((x) => x[1]));
  }
  if (langKeys.ko && langKeys.en) {
    for (const key of langKeys.ko) if (!langKeys.en.has(key)) fail(`I18N key "${key}" exists in ko but not in en`);
    for (const key of langKeys.en) if (!langKeys.ko.has(key)) fail(`I18N key "${key}" exists in en but not in ko`);
    ok(`ko/en key parity (${langKeys.ko.size} keys)`);
    const dataI18nKeys = new Set([...indexSrc.matchAll(/data-i18n="([A-Za-z0-9_]+)"/g)].map((x) => x[1]));
    for (const key of dataI18nKeys) {
      if (!langKeys.ko.has(key)) fail(`index.html data-i18n="${key}" has no I18N entry`);
    }
    ok(`index.html data-i18n attributes all resolve (${dataI18nKeys.size} keys)`);
  }
}

console.log('[5/6] styles.css asset references');
let cssAssetRefs = 0;
for (const m of stylesSrc.matchAll(/url\(["']?((?!data:|https?:|#)[^"')]+)["']?\)/g)) {
  cssAssetRefs += 1;
  const rel = m[1].trim();
  if (!fs.existsSync(path.join(root, 'src', rel))) fail(`styles.css references missing asset: src/${rel}`);
}
ok(`${cssAssetRefs} local url() reference(s) checked`);

console.log('[6/6] version consistency');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const shortVersion = 'v' + pkg.version.split('.').slice(0, 2).join('.');
if (indexSrc.includes(`>${shortVersion}<`)) ok(`package.json ${pkg.version} matches index.html pill ${shortVersion}`);
else fail(`index.html version pill does not match package.json (expected "${shortVersion}")`);

if (failures > 0) {
  console.error(`\ncheck failed: ${failures} problem(s).`);
  process.exit(1);
}
console.log('\ncheck passed.');
