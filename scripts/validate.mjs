#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Let the first argument be the root directory to validate, so we can test it with temp dirs
const ROOT = process.argv[2] || path.join(import.meta.dirname, '..', 'skills');

if (!fs.existsSync(ROOT)) {
  console.error(`Skills directory not found: ${ROOT}`);
  process.exit(1);
}

function cleanYamlValue(val) {
  if (!val) return '';
  let joined = val.trim();

  // If the value is enclosed in quotes on the first line, strip comments after the quotes
  const m = joined.match(/^(['"])([\s\S]*?)\1\s*(?:#.*)?$/);
  if (m) {
    return m[2].trim();
  }

  let lines = joined.split('\n');

  // Strip inline comments on the first line, but only if they are not enclosed in quotes
  lines[0] = lines[0].replace(/\s+#.*$/, '').trim();

  // Strip YAML block scalar indicators (like >- or |+)
  lines[0] = lines[0].replace(/^[>|][+-]?\s*/, '').trim();

  return lines.join('\n').trim();
}

const errors = [];
const seenNames = new Set();

function* walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const p = path.join(dir, e.name);
      yield p;
      yield* walkDirs(p);
    }
  }
}

// Identify skill directories.
const skillDirs = new Set();

// 1. Any directory that contains a SKILL.md file.
for (const dir of walkDirs(ROOT)) {
  if (fs.existsSync(path.join(dir, 'SKILL.md'))) {
    skillDirs.add(dir);
  }
}

// 2. Any directory that is exactly ROOT/category/skill (to enforce the layout and catch missing SKILL.md).
const categories = fs.readdirSync(ROOT, { withFileTypes: true });
for (const cat of categories) {
  if (cat.isDirectory()) {
    const catDir = path.join(ROOT, cat.name);
    const potentialSkills = fs.readdirSync(catDir, { withFileTypes: true });
    for (const p of potentialSkills) {
      if (p.isDirectory()) {
        const potentialSkillDir = path.join(catDir, p.name);
        // Only enforce missing SKILL.md on ROOT/category/skill if it doesn't contain a nested skill directory
        let hasDeeperSkill = false;
        for (const deepDir of walkDirs(potentialSkillDir)) {
          if (fs.existsSync(path.join(deepDir, 'SKILL.md'))) {
            hasDeeperSkill = true;
            break;
          }
        }

        if (!hasDeeperSkill) {
          skillDirs.add(potentialSkillDir);
        }
      }
    }
  }
}

for (const dir of skillDirs) {
  const skillFile = path.join(dir, 'SKILL.md');
  const name = path.basename(dir);

  if (!fs.existsSync(skillFile)) {
    errors.push(`${skillFile}: missing SKILL.md`);
    continue;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    errors.push(`${skillFile}: missing frontmatter`);
    continue;
  }

  const fields = {};
  let cur = null;
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([A-Za-z-]+):(.*)$/);
    if (km) {
      cur = km[1];
      fields[cur] = km[2];
    } else if (cur !== null) {
      if (line.match(/^\s*#/)) {
        // standalone comment line, skip it and don't append to current field
        continue;
      } else if (line.match(/^[a-zA-Z0-9_-]+:/)) {
          cur = null;
      } else {
        fields[cur] += '\n' + line;
      }
    }
  }

  if (!fields.name) {
    errors.push(`${skillFile}: missing name in frontmatter`);
  } else {
    const cleanName = cleanYamlValue(fields.name);
    if (cleanName !== name) {
      errors.push(`${skillFile}: name mismatch (frontmatter: "${cleanName}", directory: "${name}")`);
    }
    if (seenNames.has(cleanName)) {
      errors.push(`${skillFile}: duplicate skill name "${cleanName}"`);
    }
    seenNames.add(cleanName);
  }

  const desc = cleanYamlValue(fields.description || '');

  if (desc.length < 20) {
    errors.push(`${skillFile}: description too short (${desc.length} chars)`);
  } else if (desc.length > 400) {
    errors.push(`${skillFile}: description too long (${desc.length} chars)`);
  }
}

if (errors.length > 0) {
  errors.forEach(e => console.error(e));
  process.exit(1);
}

process.exit(0);
