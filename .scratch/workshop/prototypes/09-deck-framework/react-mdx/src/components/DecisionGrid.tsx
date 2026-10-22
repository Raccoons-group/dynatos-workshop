// PROTOTYPE (ticket 09). Strings from the JSON only ever go through {...}, never dangerouslySetInnerHTML.
import type { CSSProperties } from 'react'
import { DECISIONS, examplesInTests, groupLabel, hhmm, hhmmss } from '../../../shared/live-deck'
import { useLiveDeckData } from '../live-data'

export function DecisionGrid() {
  const live = useLiveDeckData()
  if (!live) return null
  const groups = Object.values(live.groups)
  return (
    <>
      <span className="rac-read">groups/*.json · read {hhmmss(live.readAt)}</span>
      <div className="rac-grid" style={{ '--rac-cols': Math.max(groups.length, 1) } as CSSProperties}>
        <span />
        {groups.map((o) => (
          <div key={o.group} className="rac-card rac-group">
            <div className="rac-group-name">
              {groupLabel(o.group)}
              <span className={`rac-ci rac-ci-${o.facts.ci.result}`}>CI {o.facts.ci.result}</span>
            </div>
            <div className="rac-group-meta">
              {o.facts.phase}
              {o.facts.specReviewedAt && ` · reviewed ${hhmm(o.facts.specReviewedAt)}`}
              <br />
              {o.judgements.acceptanceExamples.length} examples · {examplesInTests(o)} in tests · updated{' '}
              {hhmm(o.facts.lastPushAt)}
            </div>
          </div>
        ))}
        {DECISIONS.map(([key, label]) => [
          <span key={key} className="rac-rowlabel">
            {label}
          </span>,
          ...groups.map((o) => {
            const d = o.judgements.decisions[key]
            return (
              <div key={`${o.group}:${key}:${d.call}:${d.line}`} className="rac-card rac-cell">
                <span className={`rac-chip rac-chip-${d.call}`}>{d.call}</span>
                <span className={d.line ? 'rac-line' : 'rac-line rac-line-empty'}>{d.line || '—'}</span>
              </div>
            )
          }),
        ])}
      </div>
    </>
  )
}
