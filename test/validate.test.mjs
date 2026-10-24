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

test('comment-only description exits 1 as missing', () => {
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: # a sufficiently long comment here\n---\n'),
    'missing description',
  );
});

test('trailing comment on name and description is ignored', () => {
  withTree(
    (root) => skill(root, 'alpha', `---\nname: alpha # note\ndescription: ${GOOD_DESC} # trailing\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('trailing comment does not count toward description length', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: short # ${'x'.repeat(50)}\n---\n`),
    'description length 5',
  );
});

test('hash inside a quoted string is preserved', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "ab # cd" # real comment\n---\n`),
    'description length 7',
  );
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC} issue #12 fixed"\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('hash without preceding whitespace is part of the value', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: abc#def\n---\n`),
    'description length 7',
  );
});

test('plain multiline description is rejected, not truncated', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription:\n  ${GOOD_DESC}\n  second line\n---\n`),
    'key "description": multiline values are not supported',
  );
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: ${GOOD_DESC}\n  continued here\n---\n`),
    'key "description": multiline values are not supported',
  );
});

test('block scalars are rejected for name and description', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: >\n  ${GOOD_DESC}\n---\n`),
    'key "description": multiline values are not supported',
  );
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: |-\n  ${GOOD_DESC}\n---\n`),
    'key "description": multiline values are not supported',
  );
});

test('multiline value on other keys is ignored', () => {
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: ${GOOD_DESC}\nallowed-tools:\n  - Bash\n  - Read\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('escaped double quote does not end the string', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "ab \\" # cd"\n---\n`),
    'description length 9',
  );
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC} say \\"hi\\" # ok" # c\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('doubled single quote is a literal quote', () => {
  // Value is 32 chars (valid); truncating at the # would leave 7 and fail.
  withTree(
    (root) => skill(root, 'a', "---\nname: a\ndescription: 'short '' # sufficiently long text'\n---\n"),
    (root) => assert.equal(run(root).status, 0),
  );
  expectFail(
    (root) => skill(root, 'a', "---\nname: a\ndescription: 'ab '' # cd'\n---\n"),
    'description length 9',
  );
});

test('\\uXXXX escapes are decoded before counting length', () => {
  // 4 escapes = 4 chars, even though the source text is 24 chars long.
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: "\\u0061\\u0062\\u0063\\u0064"\n---\n'),
    'description length 4',
  );
  // 20 decoded chars passes (10 escapes + 10 literals).
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "${'\\u0061'.repeat(10)}${'b'.repeat(10)}"\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('\\x and standard single-char escapes are decoded', () => {
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: "\\x41\\n\\t\\"\\\\\\/"\n---\n'),
    'description length 6',
  );
});

test('unsupported or malformed escapes are rejected', () => {
  expectFail((root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC} \\q"\n---\n`), 'unsupported escape \\q');
  expectFail((root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC} \\u12"\n---\n`), 'invalid \\u escape');
  expectFail((root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC}\\\n---\n`), 'unterminated quoted string');
});

test('unquoted collections are rejected', () => {
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: [a sufficiently long description]\n---\n'),
    'collections are not supported',
  );
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: {a: sufficiently long description}\n---\n'),
    'collections are not supported',
  );
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: "[${GOOD_DESC}]"\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
});

test('duplicate keys are rejected', () => {
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription: ${GOOD_DESC}\ndescription: ${GOOD_DESC} again\n---\n`),
    'key "description": duplicate key',
  );
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\nname: a\ndescription: ${GOOD_DESC}\n---\n`),
    'key "name": duplicate key',
  );
});

test('unquoted value containing ": " is rejected with a quoting hint', () => {
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: Use this skill when: writing articles.\n---\n'),
    'wrap the value in quotes',
  );
  expectFail(
    (root) => skill(root, 'a', '---\nname: a\ndescription: A long enough description ending with colon:\n---\n'),
    'wrap the value in quotes',
  );
  // Quoted, or colon without following space, is fine.
  withTree(
    (root) => {
      skill(root, 'a', '---\nname: a\ndescription: "Use this skill when: writing articles."\n---\n');
      skill(root, 'b', '---\nname: b\ndescription: See https://example.com/path for the details\n---\n');
    },
    (root) => assert.equal(run(root).status, 0),
  );
});

test('indentationless list on other keys is ignored, rejected on name/description', () => {
  withTree(
    (root) => skill(root, 'a', `---\nname: a\ndescription: ${GOOD_DESC}\nallowed-tools:\n- Read\n- Write\nversion: 1.0.0\n---\n`),
    (root) => assert.equal(run(root).status, 0),
  );
  expectFail(
    (root) => skill(root, 'a', `---\nname: a\ndescription:\n- one\n- two\n---\n`),
    'key "description": multiline values are not supported',
  );
});

test('unterminated quote and trailing junk after quote are rejected', () => {
  expectFail((root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC}\n---\n`), 'unterminated quoted string');
  expectFail((root) => skill(root, 'a', `---\nname: a\ndescription: "${GOOD_DESC}" junk\n---\n`), 'unexpected text after quoted value');
});
