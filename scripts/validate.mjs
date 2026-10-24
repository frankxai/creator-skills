#!/usr/bin/env node
// Skill frontmatter validator. No dependencies, no shelling out.
// Usage: node scripts/validate.mjs [skillsRoot]   (default: <repo>/skills)
// Rules: frontmatter with name+description; name === directory name;
// description 20..400 chars; names unique. Exit 1 on any failure.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIN_DESC = 20;
const MAX_DESC = 400;

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

function unquote(v) {
  const t = v.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))) {
    return t.slice(1, -1);
  }
  return t;
}

// Returns { fields } or { error }.
export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') return { error: 'missing frontmatter (file must start with ---)' };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return { error: 'unterminated frontmatter (no closing ---)' };
  const fields = {};
  for (let i = 1; i < end; i++) {
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    const [, key, rest] = m;
    if (/^[>|][+-]?$/.test(rest.trim())) {
      const block = [];
      while (i + 1 < end && (/^\s/.test(lines[i + 1]) || lines[i + 1] === '')) block.push(lines[++i].trim());
      fields[key] = (rest.trim().startsWith('>') ? block.join(' ') : block.join('\n')).trim();
    } else if (rest === '') {
      const block = [];
      while (i + 1 < end && /^\s+\S/.test(lines[i + 1])) block.push(lines[++i].trim());
      fields[key] = block.join(' ');
    } else {
      fields[key] = unquote(rest);
    }
  }
  return { fields };
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
    const { name, description } = parsed.fields;
    if (!name) failures.push(`${rel}: frontmatter missing name`);
    if (!description) failures.push(`${rel}: frontmatter missing description`);
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
