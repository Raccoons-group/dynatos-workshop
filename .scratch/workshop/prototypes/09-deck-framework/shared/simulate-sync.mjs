// PROTOTYPE (ticket 09). Stands in for the presenter laptop's sync of the
// `live-deck-data` branch: resets shared/live-deck-data/ from the seed, then
// rewrites one group's observation every few seconds, the way a checkout would.
//
//   node shared/simulate-sync.mjs            one change every 6 s, loops
//   node shared/simulate-sync.mjs --torn     each write lands half a file first
//   node shared/simulate-sync.mjs --once     reset to the seed and exit
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const seed = join(here, 'seed', 'groups')
const live = join(here, 'live-deck-data', 'groups')
const torn = process.argv.includes('--torn')
const every = 6000

function reset() {
  rmSync(live, { recursive: true, force: true })
  mkdirSync(dirname(live), { recursive: true })
  cpSync(seed, live, { recursive: true })
}

const steps = [
  ['group-b', (o) => decide(o, 'deadline', 'in', 'Host picks it; 11:30 by default')],
  ['group-c', (o) => { o.facts.phase = 'Specifying'; decide(o, 'join', 'in', 'Six-digit code, shown to the host') }],
  ['group-a', (o) => decide(o, 'minimumOrderAndFee', 'in', 'On the group total; fee share shown, not paid')],
  ['group-b', (o) => decide(o, 'editRights', 'in', 'Own dishes only')],
  ['group-c', (o) => decide(o, 'deadline', 'in', 'Fixed at 11:30')],
  ['group-b', (o) => { o.facts.phase = 'Spec reviewed'; o.facts.specReviewedAt = new Date().toISOString() }],
  ['group-a', (o) => { o.judgements.acceptanceExamples[0].test = 'Joining_with_code_shows_shared_basket' }],
]

function decide(o, key, call, line) {
  o.judgements.decisions[key] = { call, line, evidence: [] }
}

async function write(group, mutate) {
  const file = join(live, `${group}.json`)
  const o = JSON.parse(readFileSync(file, 'utf8'))
  mutate(o)
  const now = new Date().toISOString()
  o.reportedAt = now
  o.facts.lastPushAt = now
  const text = JSON.stringify(o, null, 2) + '\n'
  if (torn) {
    writeFileSync(file, text.slice(0, text.length / 2))
    await new Promise((r) => setTimeout(r, 400))
  }
  writeFileSync(file, text)
  console.log(`${now.slice(11, 19)}  ${group}  ${torn ? '(torn, then whole)' : ''}`)
}

reset()
console.log(`reset ${live}`)
if (!process.argv.includes('--once')) {
  let i = 0
  setInterval(async () => {
    if (i === steps.length) {
      reset()
      console.log('loop: back to the seed')
      i = 0
      return
    }
    const [group, mutate] = steps[i++]
    await write(group, mutate)
  }, every)
}
