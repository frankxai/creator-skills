import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'validate.mjs');
const GOOD_DESC = 'A perfectly reasonable skill description for testing.';

function skill(root, dir, content) {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, 'SKILL.md'), content);
}
const fm = (name, desc) => `---\nname: ${name}\ndescription: ${desc}\n---\n\n# body\n`;

// Returns { status, stdout, stderr }. Only a numeric child exit status is
// captured; any other error (spawn failure, timeout) is rethrown.
function run(root) {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT, root], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    if (typeof err.status !== 'number') throw err;
    return { status: err.status, stdout: String(err.stdout), stderr: String(err.stderr) };
  }
}

function withTree(setup, check) {
  const root = mkdtempSync(join(tmpdir(), 'skillval-'));
  try {
    setup(root);
    check(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function expectFail(setup, text) {
  withTree(setup, (root) => {
    const r = run(root);
    assert.equal(r.status, 1, `expected exit 1, got ${r.status}\n${r.stderr}`);
    assert.ok(r.stderr.includes(text), `stderr missing "${text}":\n${r.stderr}`);
    assert.ok(r.stderr.includes('SKILL.md'), 'stderr should list the relative path');
  });
}

test('clean tree exits 0 (including CRLF files)', () => {
  withTree(
    (root) => {
      skill(root, 'cat/alpha', fm('alpha', GOOD_DESC));
      skill(root, 'cat/beta', fm('beta', GOOD_DESC).replace(/\n/g, '\r\n'));
    },
    (root) => {
      const r = run(root);
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /OK: 2 skill/);
    },
  );
});

test('missing frontmatter exits 1', () => {
  expectFail((root) => skill(root, 'a', '# no frontmatter\n'), 'missing frontmatter');
});

test('missing name exits 1', () => {
  expectFail((root) => skill(root, 'a', `---\ndescription: ${GOOD_DESC}\n---\n`), 'missing name');
});

test('missing description exits 1', () => {
  expectFail((root) => skill(root, 'a', '---\nname: a\n---\n'), 'missing description');
});

test('name differing from directory exits 1', () => {
  expectFail((root) => skill(root, 'a', fm('other', GOOD_DESC)), 'does not match directory "a"');
});

test('description too short exits 1', () => {
  expectFail((root) => skill(root, 'a', fm('a', 'too short')), 'description length 9');
});

test('description of 1025 chars exits 1', () => {
  expectFail((root) => skill(root, 'a', fm('a', 'x'.repeat(1025))), 'description length 1025');
});

test('description boundaries 20 and 1024 pass', () => {
  withTree(
    (root) => {
      skill(root, 'a', fm('a', 'x'.repeat(20)));
      skill(root, 'b', fm('b', 'x'.repeat(1024)));
    },
    (root) => assert.equal(run(root).status, 0),
  );
});

test('duplicate names exit 1', () => {
  expectFail((root) => {
    skill(root, 'one/dup', fm('dup', GOOD_DESC));
    skill(root, 'two/dup', fm('dup', GOOD_DESC));
  }, 'duplicate name "dup"');
});

test('missing skills root exits 1', () => {
  const missing = join(tmpdir(), `skillval-missing-${process.pid}-${Date.now()}`);
  const r = run(missing);
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes('skills root not found'), r.stderr);
});

test('description of 19 chars exits 1', () => {
  expectFail((root) => skill(root, 'a', fm('a', 'x'.repeat(19))), 'description length 19');
});
