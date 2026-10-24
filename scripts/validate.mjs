#!/usr/bin/env node
// Skill frontmatter validator. Does not shell out; only dependency is `yaml`.
// Usage: node scripts/validate.mjs [skillsRoot]   (default: <repo>/skills)
// Rules: valid YAML frontmatter (unique keys) with string name+description;
// name === directory name; description 20..1024 chars after parsing;
// names unique across skills. Exit 1 on any failure.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

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

// Returns { data } (parsed frontmatter object) or { errors: string[] }.
export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  // Fences are exactly --- at column zero (trailing spaces allowed); an
  // indented --- belongs to the YAML content (e.g. inside a block scalar).
  const FENCE = /^---[ \t]*$/;
  if (!FENCE.test(lines[0])) return { errors: ['missing frontmatter (file must start with ---)'] };
  const end = lines.findIndex((l, i) => i > 0 && FENCE.test(l));
  if (end === -1) return { errors: ['unterminated frontmatter (no closing ---)'] };
  const doc = YAML.parseDocument(lines.slice(1, end).join('\n'), { uniqueKeys: true });
  if (doc.errors.length > 0) {
    return { errors: doc.errors.map((e) => `invalid YAML frontmatter: ${e.message.split('\n')[0]}`) };
  }
  let data;
  try {
    data = doc.toJS();
  } catch (err) {
    // e.g. an alias that references an undefined anchor
    return { errors: [`invalid YAML frontmatter: ${err.message}`] };
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { errors: ['frontmatter must be a YAML mapping'] };
  }
  return { data };
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
    if (parsed.errors) {
      for (const e of parsed.errors) failures.push(`${rel}: ${e}`);
      continue;
    }
    const { name, description } = parsed.data;
    let nameOk = false;
    if (name === undefined || name === null || name === '') failures.push(`${rel}: frontmatter missing name`);
    else if (typeof name !== 'string') failures.push(`${rel}: name must be a string`);
    else nameOk = true;
    let descOk = false;
    if (description === undefined || description === null || description === '') {
      failures.push(`${rel}: frontmatter missing description`);
    } else if (typeof description !== 'string') {
      failures.push(`${rel}: description must be a string`);
    } else {
      descOk = true;
    }
    if (nameOk) {
      const dir = basename(dirname(file));
      if (name !== dir) failures.push(`${rel}: name "${name}" does not match directory "${dir}"`);
      if (seen.has(name)) failures.push(`${rel}: duplicate name "${name}" (also in ${seen.get(name)})`);
      else seen.set(name, rel);
    }
    if (descOk && (description.length < MIN_DESC || description.length > MAX_DESC)) {
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
