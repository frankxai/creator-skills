import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const VALIDATOR = path.join(import.meta.dirname, 'validate.mjs');

function runValidator(dir) {
  try {
    execFileSync(process.execPath, [VALIDATOR, dir], { stdio: 'pipe', encoding: 'utf8' });
    return 0;
  } catch (err) {
    return err.status;
  }
}

describe('validate.mjs', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const setupFixture = (name, category, skillName, frontmatter) => {
    const dir = path.join(tmpDir, name, category, skillName);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---`);
    return path.join(tmpDir, name);
  };

  test('clean tree exits 0', () => {
    const root = setupFixture('clean', 'cat1', 'skill-1', 'name: skill-1\ndescription: This is a twenty character description.');
    setupFixture('clean', 'cat2', 'skill-2', 'name: skill-2\ndescription: This is another twenty character description.');
    assert.strictEqual(runValidator(root), 0);
  });

  test('name mismatch exits 1', () => {
    const root = setupFixture('mismatch', 'cat', 'skill-a', 'name: skill-b\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 1);
  });

  test('duplicate name exits 1', () => {
    const root = setupFixture('duplicate', 'cat1', 'skill-a', 'name: skill-a\ndescription: This is a twenty character description.');
    setupFixture('duplicate', 'cat2', 'skill-a', 'name: skill-a\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 1);
  });

  test('description too short exits 1', () => {
    const root = setupFixture('short', 'cat', 'skill-a', 'name: skill-a\ndescription: short');
    assert.strictEqual(runValidator(root), 1);
  });

  test('description too long exits 1', () => {
    const root = setupFixture('long', 'cat', 'skill-a', `name: skill-a\ndescription: ${'a'.repeat(401)}`);
    assert.strictEqual(runValidator(root), 1);
  });

  test('missing SKILL.md exits 1', () => {
    const root = path.join(tmpDir, 'missing');
    fs.mkdirSync(path.join(root, 'cat', 'skill-a'), { recursive: true });
    assert.strictEqual(runValidator(root), 1);
  });
});

describe('yaml parsing edge cases', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-yaml-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const setupFixture = (name, category, skillName, frontmatter) => {
    const dir = path.join(tmpDir, name, category, skillName);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---`);
    return path.join(tmpDir, name);
  };

  test('handles quotes and comments in name', () => {
    const root = setupFixture('yaml', 'cat', 'skill-quoted', 'name: "skill-quoted" # inline comment\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 0);
  });

  test('handles block scalars in description', () => {
    const root = setupFixture('yaml2', 'cat', 'skill-block', 'name: skill-block\ndescription: >-\n  This is a twenty character description.');
    assert.strictEqual(runValidator(root), 0);
  });
});

describe('review edge cases', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-review-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const setupFixtureNested = (name, relativePath, frontmatter) => {
    const dir = path.join(tmpDir, name, relativePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\n${frontmatter}\n---`);
    return path.join(tmpDir, name);
  };

  test('comment with quote', () => {
    const root = setupFixtureNested('yaml-quotes', 'cat/skill-hash', 'name: skill-hash\ndescription: "This is a valid # description of a skill."');
    assert.strictEqual(runValidator(root), 0);
  });

  test('standalone comment between fields', () => {
    const root = setupFixtureNested('yaml-comment', 'cat/skill-comment', 'name: skill-comment\n# standalone comment\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 0);
  });

  test('nested skills', () => {
    const root = setupFixtureNested('yaml-nested', 'cat/subcat/subsubcat/skill-nested', 'name: skill-nested\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 0);
  });

  test('nested skills failure', () => {
    const root = setupFixtureNested('yaml-nested-fail', 'cat/subcat/subsubcat/skill-nested-f', 'name: wrong-name\ndescription: This is a twenty character description.');
    assert.strictEqual(runValidator(root), 1);
  });
});
