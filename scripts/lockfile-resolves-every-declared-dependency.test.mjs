// Guard: package-lock.json must resolve every dependency its own entries declare.
//
// This is the check `npm ci` runs first ("Missing: X from lock file"), and it is
// platform-independent - so this suite fails on any machine the moment the lockfile
// regresses, instead of the failure only surfacing on the Linux CI runner.
//
// Why it exists: on 2026-09-09 a Windows `npm audit fix --package-lock-only`
// (commit 99222ad) silently dropped the wasm32 optional subtree (@emnapi/core,
// @emnapi/wasi-threads under @tailwindcss/oxide-wasm32-wasi). Every Linux
// `npm ci` then failed with EUSAGE in seconds - Critical Path Tests,
// Deploy to Staging, and the production gate all went red at the install step.
// The same shape had already bitten twice before (8154c3b, 3600c2a), so it now
// has a guard.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const lock = JSON.parse(readFileSync(join(repoRoot, 'package-lock.json'), 'utf8'))
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))

// Resolve a dependency the way npm does from an installed location:
// walk up the node_modules chain until the package is found.
// entryPath is a packages key like "node_modules/a/node_modules/b".
function resolves(entryPath, depName) {
  let dir = entryPath
  while (true) {
    const candidate = dir === '' ? `node_modules/${depName}` : `${dir}/node_modules/${depName}`
    if (lock.packages[candidate]) return candidate
    if (dir === '') return null
    const idx = dir.lastIndexOf('/node_modules/')
    dir = idx === -1 ? '' : dir.slice(0, idx)
  }
}

test('lockfileVersion is 3 and every package.json dependency has a lock entry', () => {
  assert.equal(lock.lockfileVersion, 3)
  assert.ok(lock.packages[''], 'root package entry missing')
  for (const [name, range] of Object.entries(pkg.dependencies ?? {})) {
    assert.ok(
      lock.packages[`node_modules/${name}`],
      `package.json dependency ${name}@${range} has no lockfile entry`
    )
  }
})

test('every dependency declared by every lock entry resolves inside the lockfile', () => {
  const missing = []
  for (const [entryPath, entry] of Object.entries(lock.packages)) {
    if (entryPath === '') continue
    for (const field of ['dependencies', 'optionalDependencies']) {
      for (const [depName, range] of Object.entries(entry[field] ?? {})) {
        if (!resolves(entryPath, depName)) {
          missing.push(`${entryPath} (${entry.version}) declares ${depName}@${range} but the lockfile has no entry for it`)
        }
      }
    }
  }
  assert.deepEqual(missing, [], missing.join('\n'))
})

test('the wasm32 optional subtrees that keep disappearing are present', () => {
  // sharp's WASM build and tailwind's oxide WASM build both need @emnapi pieces;
  // Windows lock-only operations have dropped exactly these three times now.
  const required = [
    'node_modules/@img/sharp-wasm32',
    'node_modules/@emnapi/runtime',
    'node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/core',
    'node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads',
  ]
  for (const key of required) {
    assert.ok(lock.packages[key], `missing lockfile entry: ${key}`)
  }
})

test('the two advisory patches that unblocked gate-security are still in the lock', () => {
  // sharp HIGH advisory fixed in 0.35.4; js-yaml HIGH advisory fixed in 4.3.2.
  // If a future lockfile regeneration slides either back below these floors,
  // gate-security (`npm audit --audit-level=high`) goes red again.
  const sharp = lock.packages['node_modules/sharp']
  assert.ok(sharp, 'sharp entry missing')
  const [, sharpMinor, sharpPatch] = sharp.version.split('.').map(Number)
  assert.ok(
    sharpMinor > 35 || (sharpMinor === 35 && sharpPatch >= 4),
    `sharp ${sharp.version} is below the patched 0.35.4`
  )

  const jsYaml = lock.packages['node_modules/js-yaml']
  assert.ok(jsYaml, 'js-yaml entry missing')
  const [jyMajor, jyMinor, jyPatch] = jsYaml.version.split('.').map(Number)
  assert.ok(
    jyMajor > 4 || (jyMajor === 4 && (jyMinor > 3 || (jyMinor === 3 && jyPatch >= 2))),
    `js-yaml ${jsYaml.version} is below the patched 4.3.2`
  )
})
