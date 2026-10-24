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
  // Strip inline comments on the first line (they can't appear inside unquoted multiline block scalars in our simple parsing)
  let lines = val.split('\n');
  // Only strip comments if they are at the end of the line, preceded by a space or it's the only thing
  lines[0] = lines[0].replace(/\s+#.*$/, '').trim();

  // Strip YAML block scalar indicators (like >- or |+)
  lines[0] = lines[0].replace(/^[>|][+-]?\s*/, '').trim();

  let joined = lines.join('\n').trim();
  // Strip surrounding quotes if present
  joined = joined.replace(/^["']([\s\S]*)["']$/, '$1');
  return joined.trim();
}


const errors = [];
const seenNames = new Set();

for (const category of fs.readdirSync(ROOT)) {
  const catDir = path.join(ROOT, category);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const name of fs.readdirSync(catDir)) {
    const dir = path.join(catDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const skillFile = path.join(dir, 'SKILL.md');
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
        fields[cur] = km[2].trim();
      } else if (cur !== null) {
        fields[cur] += '\n' + line.trim();
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
}

if (errors.length > 0) {
  errors.forEach(e => console.error(e));
  process.exit(1);
}

process.exit(0);
