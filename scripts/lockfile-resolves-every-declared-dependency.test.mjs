/**
 * `npm ci` MUST BE ABLE TO RESOLVE EVERY DECLARED DEPENDENCY FROM package-lock.json ALONE.
 *
 * Board row `monitor-scoutcopilot-ff4b4a1c`. Twice in one day master became unbuildable on
 * every machine except the one that edited the lockfile:
 *
 *   npm error `npm ci` can only install packages when your package.json and package-lock.json
 *   npm error Missing: @emnapi/core@1.11.3 from lock file
 *   npm error Missing: @emnapi/wasi-threads@1.2.3 from lock file
 *
 * (Critical Path Tests run 34396326463 on 6997a6d, run 34395892700 on 2494816, Deploy to
 * Staging run 34386899296, regen-lock run 34387060702 — all dead at the install step.)
 *
 * WHY IT KEEPS HAPPENING. `@tailwindcss/oxide-wasm32-wasi` is an OPTIONAL platform package.
 * Running any lockfile-editing npm command on Windows — `npm audit fix --package-lock-only`
 * (commit 99222ad) or plain `npm install --package-lock-only` — prunes the parts of that
 * subtree the local platform will never install, and the pruned lockfile is then incomplete
 * for the Linux runners, which DO resolve it. Measured on this machine 2026-09-09T19:58Z:
 * `npm install --package-lock-only` on a clean checkout of origin/master deleted a further
 * entry (`node_modules/@emnapi/runtime`) rather than repairing the two that were missing.
 * The repair therefore has to happen on Linux — that is what .github/workflows/regen-lock.yml
 * is for — but nothing was CHECKING the result, so a lockfile that could not install shipped
 * to master twice.
 *
 * WHAT THIS ASSERTS. The same question npm ci asks, answered without npm and without a
 * network, so it runs identically on Windows and on the runners: walk every entry in the
 * lockfile's `packages` tree and, for each name it declares in `dependencies` and
 * `optionalDependencies`, resolve it the way node does — nearest `node_modules` first, then
 * up the chain to the root — and require that the entry exists AND that its version
 * satisfies the declared range.
 *
 * Ranges are matched by a small semver implementation in this file rather than a dependency,
 * because this suite has to be runnable before `npm ci` has succeeded — which is precisely
 * the situation it exists to diagnose. Any range shape it does not understand FAILS the test
 * rather than being skipped: a checker that silently ignores what it cannot parse is how a
 * guard turns into decoration.
 *
 * PEER DEPENDENCIES ARE OUT OF SCOPE, deliberately. npm's peer placement depends on the
 * install strategy and on `peerDependenciesMeta`, and replicating it here would produce
 * failures npm ci does not have. The failure this guard is for is a missing REAL dependency.
 *
 * PROVEN RED BEFORE IT WAS TRUSTED GREEN: pointed at origin/master's own lockfile (6997a6d)
 * it reports exactly the two entries npm named — @emnapi/core and @emnapi/wasi-threads under
 * @tailwindcss/oxide-wasm32-wasi — and exits 1. Run it against any lockfile with
 * LOCKFILE=<path> node --test scripts/lockfile-resolves-every-declared-dependency.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const lockfilePath = process.env.LOCKFILE || join(repoRoot, 'package-lock.json');

// ---------------------------------------------------------------------------
// A small, strict semver. Everything it cannot parse throws, on purpose.
// ---------------------------------------------------------------------------
function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(v).trim());
  if (!m) throw new Error(`unparsable version: ${v}`);
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split('.') : [] };
}

function comparePre(a, b) {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1; // no prerelease sorts ABOVE a prerelease
  if (b.length === 0) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i], y = b[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) { if (+x !== +y) return +x < +y ? -1 : 1; continue; }
    if (xn !== yn) return xn ? -1 : 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function compare(a, b) {
  for (const k of ['major', 'minor', 'patch']) if (a[k] !== b[k]) return a[k] < b[k] ? -1 : 1;
  return comparePre(a.pre, b.pre);
}

/**
 * A version as it appears on the RANGE side, where the minor and patch may be absent
 * ("debug": "4") or a wildcard ("4.x"). Returns the parts that were actually given.
 */
function parsePartial(v) {
  const m = /^v?(\d+|[xX*])(?:\.(\d+|[xX*])(?:\.(\d+|[xX*])(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?)?)?$/.exec(String(v).trim());
  if (!m) throw new Error(`unparsable version: ${v}`);
  const num = (s) => (s === undefined || /^[xX*]$/.test(s) ? null : +s);
  return { major: num(m[1]), minor: num(m[2]), patch: num(m[3]), pre: m[4] ? m[4].split('.') : [] };
}

const at = (p) => ({ major: p.major ?? 0, minor: p.minor ?? 0, patch: p.patch ?? 0, pre: p.pre });
const bump = (major, minor, patch) => ({ major, minor, patch, pre: [] });

/** The upper bound of a range whose minor and/or patch were left out: 4 -> <5, 4.2 -> <4.3. */
function partialUpper(p) {
  if (p.major === null) return null;
  if (p.minor === null) return bump(p.major + 1, 0, 0);
  if (p.patch === null) return bump(p.major, p.minor + 1, 0);
  return null;
}

/** Expand `^x.y.z` / `~x.y` / `4` / `>=x.y.z` … into explicit [op, version] pairs. */
function comparators(part) {
  const t = part.trim();
  if (t === '' || t === '*' || t === 'x' || t === 'X' || t === 'latest') return [];
  let m;
  if ((m = /^\^(.+)$/.exec(t))) {
    const p = parsePartial(m[1]);
    const partial = partialUpper(p);
    if (partial) return [['>=', at(p)], ['<', partial]];
    const upper = p.major > 0 ? bump(p.major + 1, 0, 0)
      : p.minor > 0 ? bump(0, p.minor + 1, 0)
        : bump(0, 0, p.patch + 1);
    return [['>=', at(p)], ['<', upper]];
  }
  if ((m = /^~(.+)$/.exec(t))) {
    const p = parsePartial(m[1]);
    const partial = partialUpper(p);
    if (partial) return [['>=', at(p)], ['<', partial]];
    return [['>=', at(p)], ['<', bump(p.major, p.minor + 1, 0)]];
  }
  if ((m = /^(>=|<=|>|<|=)\s*(.+)$/.exec(t))) {
    const p = parsePartial(m[2]);
    const op = m[1] === '=' ? '=' : m[1];
    // ">=4" means >=4.0.0; "<4" means <4.0.0 — both read from the parts that were given.
    return [[op, at(p)]];
  }
  const p = parsePartial(t);
  const partial = partialUpper(p);
  if (partial) return [['>=', at(p)], ['<', partial]];
  return [['=', at(p)]];
}

function satisfies(version, range) {
  const v = parseVersion(version);
  // A range is alternatives separated by ||; each alternative is a space-separated
  // comparator set, and every comparator in the set has to hold.
  return String(range).split('||').some((alt) => {
    const comps = alt.trim().split(/\s+/).filter(Boolean).flatMap(comparators);
    return comps.every(([op, want]) => {
      const c = compare(v, want);
      if (op === '>=') return c >= 0;
      if (op === '<=') return c <= 0;
      if (op === '>') return c > 0;
      if (op === '<') return c < 0;
      return c === 0;
    });
  });
}

// ---------------------------------------------------------------------------
// node_modules resolution, exactly as node (and therefore npm ci) does it.
// ---------------------------------------------------------------------------
/** "node_modules/a/node_modules/b" + dep "d" -> the candidate keys, nearest first. */
function candidates(fromPath, dep) {
  const out = [];
  let p = fromPath;
  for (;;) {
    out.push(p ? `${p}/node_modules/${dep}` : `node_modules/${dep}`);
    const i = p.lastIndexOf('/node_modules/');
    if (i === -1) break;
    p = p.slice(0, i);
  }
  if (out[out.length - 1] !== `node_modules/${dep}`) out.push(`node_modules/${dep}`);
  return out;
}

test('every range in the lockfile is one this checker understands', () => {
  const lock = JSON.parse(readFileSync(lockfilePath, 'utf8'));
  const unparsable = [];
  for (const [key, entry] of Object.entries(lock.packages || {})) {
    for (const field of ['dependencies', 'optionalDependencies']) {
      for (const [dep, range] of Object.entries(entry[field] || {})) {
        try {
          satisfies('1.0.0', range);
        } catch (e) {
          unparsable.push(`${key || '<root>'} -> ${dep}@${range}: ${e.message}`);
        }
      }
    }
  }
  assert.deepEqual(unparsable, [], `ranges this guard cannot check (fix the guard, do not skip them):\n${unparsable.join('\n')}`);
});

test('npm ci can resolve every declared dependency from the lockfile alone', () => {
  const lock = JSON.parse(readFileSync(lockfilePath, 'utf8'));
  const packages = lock.packages || {};
  assert.ok(Object.keys(packages).length > 10, 'lockfile has no packages tree — wrong file?');

  const missing = [];
  const mismatched = [];

  for (const [key, entry] of Object.entries(packages)) {
    if (entry.link) continue; // workspace symlink: its target carries the deps
    for (const field of ['dependencies', 'optionalDependencies']) {
      for (const [dep, range] of Object.entries(entry[field] || {})) {
        if (String(range).startsWith('npm:') || String(range).startsWith('file:')) continue;
        const found = candidates(key, dep).find((c) => packages[c]);
        if (!found) { missing.push(`${key || '<root>'} needs ${dep}@${range} — no entry anywhere up the node_modules chain`); continue; }
        const have = packages[found].version;
        if (have && !satisfies(have, range)) {
          mismatched.push(`${key || '<root>'} needs ${dep}@${range} but ${found} is ${have}`);
        }
      }
    }
  }

  assert.deepEqual(missing, [], `MISSING FROM LOCK FILE — this is the exact error npm ci prints and the install dies at:\n${missing.join('\n')}`);
  assert.deepEqual(mismatched, [], `resolved to a version outside the declared range:\n${mismatched.join('\n')}`);
});

test('the optional wasm32 subtree that keeps getting pruned on Windows is intact', () => {
  // Named explicitly, because the generic check above passes the moment SOMETHING resolves
  // and this subtree is the one a Windows lockfile edit deletes. Both entries below are the
  // ones npm named by name in the failing installs.
  const lock = JSON.parse(readFileSync(lockfilePath, 'utf8'));
  const packages = lock.packages || {};
  const oxide = 'node_modules/@tailwindcss/oxide-wasm32-wasi';
  if (!packages[oxide]) return; // tailwind's wasm fallback is gone from the tree — nothing to guard
  for (const dep of Object.keys(packages[oxide].dependencies || {})) {
    const found = candidates(oxide, dep).find((c) => packages[c]);
    assert.ok(found, `${oxide} declares ${dep} and no lockfile entry provides it — a Windows npm command pruned the subtree again; regenerate the lock on Linux with .github/workflows/regen-lock.yml`);
  }
});
