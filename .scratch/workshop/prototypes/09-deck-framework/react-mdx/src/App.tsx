// PROTOTYPE (ticket 09). Everything Slidev gives for free, by hand: scaling,
// keyboard and clicker navigation, a presenter view synced across windows, and
// a print view for PDF export. `/` is the audience, `/?presenter` the presenter,
// `/?print` every slide on its own page.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { DecisionGrid } from './components/DecisionGrid'
import { slides, type Slide } from './slides'

const components = { DecisionGrid }
const layouts: Record<string, string> = { 'title-cards': 'rac-title-cards', data: 'rac-data' }

function SlideView({ slide }: { slide: Slide }) {
  const { Content, meta } = slide
  return (
    <div className={`rac-slide ${layouts[meta.layout ?? ''] ?? ''}`}>
      <Content components={components} />
      <img className="rac-wordmark" src="/brand/wordmark-white.png" alt="raccoons" />
      <img className="rac-head" src="/brand/head-white.png" alt="" />
    </div>
  )
}

// Scales the 1000 × 562.5 canvas to fit its box.
function Scaled({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      if (e) setScale(Math.min(e.contentRect.width / 1000, e.contentRect.height / 562.5))
    })
    ro.observe(box.current!)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="deck-box">
      <div className="deck-canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

const clamp = (i: number) => Math.max(0, Math.min(slides.length - 1, i))
const fromHash = () => clamp(Number(location.hash.slice(1) || 1) - 1)
const channel = new BroadcastChannel('deck-nav')

function useNav() {
  const [index, setIndex] = useState(fromHash)
  useEffect(() => {
    history.replaceState(null, '', `${location.search}#${index + 1}`)
  }, [index])
  useEffect(() => {
    const go = (i: number, broadcast = true) => {
      setIndex(clamp(i))
      if (broadcast) channel.postMessage(clamp(i))
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) go(fromHash() + 1)
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) go(fromHash() - 1)
      if (e.key === 'f') document.documentElement.requestFullscreen?.()
    }
    const onMessage = (e: MessageEvent<number>) => go(e.data, false)
    const onHash = () => go(fromHash())
    window.addEventListener('keydown', onKey)
    window.addEventListener('hashchange', onHash)
    channel.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hashchange', onHash)
      channel.removeEventListener('message', onMessage)
    }
  }, [])
  return index
}

function Audience() {
  const index = useNav()
  return (
    <div className="deck-audience">
      <Scaled>
        <SlideView slide={slides[index]!} />
      </Scaled>
    </div>
  )
}

function Presenter() {
  const index = useNav()
  const [start] = useState(Date.now)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const elapsed = new Date(now - start).toISOString().slice(11, 19)
  const slide = slides[index]!
  const next = slides[index + 1]
  return (
    <div className="deck-presenter">
      <div className="p-current">
        <Scaled>
          <SlideView slide={slide} />
        </Scaled>
      </div>
      <div className="p-next">{next ? <Scaled><SlideView slide={next} /></Scaled> : <span>End of deck</span>}</div>
      <div className="p-notes">{slide.meta.notes ?? ''}</div>
      <div className="p-bar">
        <span>
          {index + 1} / {slides.length}
        </span>
        <span>{elapsed}</span>
        <span>{new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}

function Print() {
  return (
    <div className="deck-print">
      {slides.map((s) => (
        <div key={s.id} className="deck-page">
          <SlideView slide={s} />
        </div>
      ))}
    </div>
  )
}

export function App() {
  const mode = new URLSearchParams(location.search)
  if (mode.has('presenter')) return <Presenter />
  if (mode.has('print')) return <Print />
  return <Audience />
}
