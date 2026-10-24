#!/usr/bin/env node
// Skill frontmatter validator. No dependencies, no shelling out.
// Usage: node scripts/validate.mjs [skillsRoot]   (default: <repo>/skills)
// Rules: frontmatter with name+description; name === directory name;
// description 20..1024 chars; names unique. Exit 1 on any failure.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIN_DESC = 20;
const MAX_DESC = 1024;

function findSkillFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findSkillFiles(full));
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out.sort();
}

const STRICT_KEYS = new Set(['name', 'description']);

// YAML double-quoted escapes. Anything not listed here is rejected explicitly.
const SIMPLE_ESCAPES = {
  0: '\0', a: '\x07', b: '\b', t: '\t', n: '\n', v: '\v', f: '\f', r: '\r', e: '\x1b',
  ' ': ' ', '"': '"', '/': '/', '\\': '\\', N: '\x85', _: '\xa0', L: ' ', P: ' ',
};
const HEX_ESCAPES = { x: 2, u: 4, U: 8 };

// Parse one single-line scalar. Returns { value } or { error }.
// Supports plain scalars (with trailing "# comment"), "double" quoted (backslash
// escapes the next char) and 'single' quoted ('' is a literal quote).
function parseScalar(raw) {
  const t = raw.trim();
  if (/^[>|]/.test(t)) return { error: 'multiline values are not supported (block scalar)' };
  if (/^[[{]/.test(t)) return { error: 'collections are not supported (unquoted [ or { value)' };
  const q = t[0];
  if (q === '"' || q === "'") {
    let value = '';
    let i = 1;
    for (; i < t.length; i++) {
      const c = t[i];
      if (q === '"' && c === '\\') {
        if (i + 1 >= t.length) return { error: 'unterminated quoted string' };
        const e = t[++i];
        if (e in SIMPLE_ESCAPES) {
          value += SIMPLE_ESCAPES[e];
        } else if (e in HEX_ESCAPES) {
          const digits = t.slice(i + 1, i + 1 + HEX_ESCAPES[e]);
          const cp = Number.parseInt(digits, 16);
          if (digits.length !== HEX_ESCAPES[e] || !/^[0-9a-fA-F]+$/.test(digits) || cp > 0x10ffff) {
            return { error: 'invalid \\' + e + ' escape in quoted string' };
          }
          value += String.fromCodePoint(cp);
          i += HEX_ESCAPES[e];
        } else {
          return { error: 'unsupported escape \\' + e + ' in quoted string' };
        }
      } else if (q === "'" && c === "'" && t[i + 1] === "'") {
        value += "'";
        i++;
      } else if (c === q) {
        break;
      } else {
        value += c;
      }
    }
    if (i >= t.length) return { error: 'unterminated quoted string' };
    const tail = t.slice(i + 1).trim();
    if (tail !== '' && !tail.startsWith('#')) return { error: 'unexpected text after quoted value' };
    if (tail.startsWith('#') && !/\s/.test(t[i + 1] ?? '')) return { error: 'unexpected text after quoted value' };
    return { value };
  }
  if (/^[&*!%@`]/.test(t)) {
    return { error: 'YAML anchors, aliases and tags are not supported; quote the value if the character is literal' };
  }
  let plain = t;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '#' && (i === 0 || /\s/.test(t[i - 1]))) {
      plain = t.slice(0, i).trim();
      break;
    }
  }
  if (/:(\s|$)/.test(plain)) {
    return { error: 'unquoted value contains ": " (invalid YAML); wrap the value in quotes' };
  }
  return { value: plain };
}

// Returns { fields, errors } (errors: strings naming the key) or { error } for
// a broken frontmatter envelope. Only single-line key: value scalars are
// supported for name and description; anything else there is rejected.
export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') return { error: 'missing frontmatter (file must start with ---)' };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return { error: 'unterminated frontmatter (no closing ---)' };
  const fields = {};
  const errors = [];
  const rejected = new Set();
  const seenKeys = new Set();
  let current = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      if (current && STRICT_KEYS.has(current) && !rejected.has(current)) {
        rejected.add(current);
        errors.push('key "' + current + '": multiline values are not supported');
        delete fields[current];
      }
      continue;
    }
    if (/^-(\s|$)/.test(line) && current) {
      // Indentationless block sequence belonging to the previous key.
      if (STRICT_KEYS.has(current) && !rejected.has(current)) {
        rejected.add(current);
        errors.push('key "' + current + '": multiline values are not supported');
        delete fields[current];
      }
      continue;
    }
    const m = /^([A-Za-z0-9_-]+):(?:\s+(.*))?$/.exec(line);
    if (!m) {
      errors.push('line ' + (i + 1) + ': unsupported frontmatter syntax');
      current = null;
      continue;
    }
    current = m[1];
    if (seenKeys.has(current)) {
      if (STRICT_KEYS.has(current)) {
        rejected.add(current);
        errors.push('key "' + current + '": duplicate key');
      }
      continue;
    }
    seenKeys.add(current);
    if (!STRICT_KEYS.has(current)) continue;
    const parsed = parseScalar(m[2] ?? '');
    if (parsed.error) {
      rejected.add(current);
      errors.push('key "' + current + '": ' + parsed.error);
    } else {
      fields[current] = parsed.value;
    }
  }
  return { fields, errors };
}

export function validate(root) {
  const failures = [];
  let rootStat;
  try {
    rootStat = statSync(root);
  } catch (err) {
    return { failures: [`${root}: skills root not found (${err.code})`], count: 0 };
  }
  if (!rootStat.isDirectory()) return { failures: [`${root}: skills root is not a directory`], count: 0 };

  const files = findSkillFiles(root);
  const seen = new Map();
  for (const file of files) {
    const rel = relative(process.cwd(), file).split('\\').join('/');
    const parsed = parseFrontmatter(readFileSync(file, 'utf8'));
    if (parsed.error) {
      failures.push(`${rel}: ${parsed.error}`);
      continue;
    }
    for (const e of parsed.errors) failures.push(`${rel}: ${e}`);
    const { name, description } = parsed.fields;
    const bad = (k) => parsed.errors.some((e) => e.startsWith(`key "${k}"`));
    if (!name && !bad('name')) failures.push(`${rel}: frontmatter missing name`);
    if (!description && !bad('description')) failures.push(`${rel}: frontmatter missing description`);
    if (name) {
      const dir = basename(dirname(file));
      if (name !== dir) failures.push(`${rel}: name "${name}" does not match directory "${dir}"`);
      if (seen.has(name)) failures.push(`${rel}: duplicate name "${name}" (also in ${seen.get(name)})`);
      else seen.set(name, rel);
    }
    if (description && (description.length < MIN_DESC || description.length > MAX_DESC)) {
      failures.push(`${rel}: description length ${description.length} outside ${MIN_DESC}-${MAX_DESC}`);
    }
  }
  return { failures, count: files.length };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const root = resolve(process.argv[2] ?? join(repoRoot, 'skills'));
  const { failures, count } = validate(root);
  if (failures.length > 0) {
    console.error(`FAIL: ${failures.length} problem(s) in ${count} skill(s)`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`OK: ${count} skill(s) valid`);
}
