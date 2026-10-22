// PROTOTYPE (ticket 09). The bits of an observation the decision grid reads,
// shaped like assets/reporter-and-retrospective.md. Framework-neutral.

export type Call = 'in' | 'out' | 'open'
export type Evidence = { file: string; quote: string }
export type Decision = { call: Call; line: string; evidence: Evidence[] }

export type Observation = {
  group: string
  pr: number
  sha: string
  reportedAt: string
  schemaVersion: number
  facts: {
    phase: string
    draft: boolean
    specReviewedAt: string | null
    ci: { result: 'pass' | 'fail' | 'cancelled'; at: string }
    lastPushAt: string
    testsAdded: string[]
  }
  judgements: {
    now: string
    notable: string
    decisions: Record<DecisionKey, Decision>
    acceptanceExamples: { example: string; test: string | null; evidence: Evidence[] }[]
  }
}

export type LiveDeckData = { groups: Record<string, Observation>; readAt: string }

// The epic's seven points, in the order the grid shows them.
export const DECISIONS = [
  ['join', 'How colleagues join'],
  ['deadline', 'The deadline'],
  ['multipleRestaurants', 'Several restaurants'],
  ['editRights', 'Who changes what'],
  ['splitBill', 'Splitting the bill'],
  ['minimumOrderAndFee', 'Minimum order and fee'],
  ['kitchenPerPerson', 'Kitchen per person'],
] as const

export type DecisionKey = (typeof DECISIONS)[number][0]

export const groupLabel = (group: string) => `Group ${group.replace(/^group-/, '').toUpperCase()}`

export const hhmm = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''

export const hhmmss = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB') : ''

// The model never writes a number: the deck counts lists.
export const examplesInTests = (o: Observation) =>
  o.judgements.acceptanceExamples.filter((e) => e.test).length
