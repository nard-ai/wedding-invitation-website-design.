import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'

/* ───────────────────────── placeholders ───────────────────────── */
const WEDDING_DATE = new Date('2027-02-14T15:00:00') // [DATE PLACEHOLDER]
const DATE_LABEL = '[Wedding date] · 3:00 PM'
const CITY = '[City]'
const img = (id: string, w = 1080) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`
const PHOTOS = [
  img('1726766406089-0308c800b6b2'),
  img('1627964464837-6328f5931576'),
  img('1614929511547-974944a54c92'),
  img('1619439822797-e0b6e7022373'),
  img('1672184702625-71ddc099768e'),
  img('1539464443546-5e3512c46694'),
  img('1732147124876-669f11fecd14'),
]

/* ───────────────────────── icons (thin outline) ───────────────────────── */
type IP = { className?: string; fill?: boolean }
const Svg = ({ className = 'size-5', children, fill }: IP & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)
const I = {
  back: (p: IP) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>,
  gear: (p: IP) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Svg>,
  more: (p: IP) => <Svg {...p}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></Svg>,
  heart: ({ className = 'size-5' }: IP) => <HeartMark className={className} />,
  x: (p: IP) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  cal: (p: IP) => <Svg {...p}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></Svg>,
  pin: (p: IP) => <Svg {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></Svg>,
  ring: (p: IP) => <Svg {...p}><circle cx="12" cy="14.5" r="5.5" /><path d="M9.5 6l2.5-3 2.5 3-2.5 2.5z" /></Svg>,
  chat: (p: IP) => <Svg {...p}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" /></Svg>,
  cup: (p: IP) => <Svg {...p}><path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2M11 3v2" /></Svg>,
  gift: (p: IP) => <Svg {...p}><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M3 9h18M12 9v11M12 9C10 5 7 5 7 7s3 2 5 2zm0 0c2-4 5-4 5-2s-3 2-5 2" /></Svg>,
  users: (p: IP) => <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6" /></Svg>,
  star: (p: IP) => <Svg {...p}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" /></Svg>,
  sparkle: (p: IP) => <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></Svg>,
  baby: (p: IP) => <Svg {...p}><circle cx="12" cy="12" r="8" /><path d="M9 10h.01M15 10h.01M9.5 14.5a3.5 3.5 0 0 0 5 0M12 4c-1 1.5 0 2.5 1 2" /></Svg>,
  rings: (p: IP) => <Svg {...p}><circle cx="9" cy="13" r="5" /><circle cx="15" cy="13" r="5" /></Svg>,
  down: (p: IP) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  plus: (p: IP) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  minus: (p: IP) => <Svg {...p}><path d="M5 12h14" /></Svg>,
  arrow: (p: IP) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  shirt: (p: IP) => <Svg {...p}><path d="M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z" /></Svg>,
  check: (p: IP) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>,
  up: (p: IP) => <Svg {...p}><path d="M6 15l6-6 6 6" /></Svg>,
  fb: (p: IP) => <Svg {...p}><path d="M14 8h2V4.5h-2.5A3.5 3.5 0 0 0 10 8v2.5H8V14h2v6.5h3.5V14H16l.5-3.5h-3V8.6c0-.4.2-.6.5-.6z" /></Svg>,
}

/** The couple's heart mark (from the Figma frame): solid heart with a soft highlight. */
function BrandHeart({ className = 'size-5', stroke, hi = '#AD9FDF' }: { className?: string; stroke?: string; hi?: string }) {
  return (
    <svg viewBox="-1 -1 30 27.47" className={className} fill="none" aria-hidden>
      <path d="M20.246 0.022705C17.6653 0.022705 15.4057 1.19977 13.9972 3.18939C12.5888 1.19977 10.3292 0.022705 7.74848 0.022705C5.69416 0.0251609 3.72465 0.891799 2.27203 2.43249C0.819414 3.97318 0.00231547 6.0621 0 8.24096C0 17.5196 12.9712 25.0301 13.5236 25.3402C13.6692 25.4233 13.8319 25.4668 13.9972 25.4668C14.1626 25.4668 14.3253 25.4233 14.4709 25.3402C15.0233 25.0301 27.9945 17.5196 27.9945 8.24096C27.9922 6.0621 27.1751 3.97318 25.7225 2.43249C24.2698 0.891799 22.3003 0.0251609 20.246 0.022705Z" fill="currentColor" stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />
      <path d="M27.9947 8.52157C27.8442 13.1874 24.3287 16.1869 22.9905 16.3019C19.3182 16.3019 17.3386 9.64669 14.0139 3.15788C16.3303 0.0230603 19.8815 -0.588918 22.8243 0.495959C25.0833 1.32875 28.1452 3.85572 27.9947 8.52157Z" fill={hi} />
    </svg>
  )
}

/** The heart mark from the Figma frame: violet circle holding the white heart. */
function HeartMark({ className = 'size-5' }: { className?: string }) {
  return (
    <span className={cx('inline-grid shrink-0 place-items-center rounded-full bg-violet text-white', className)}>
      <BrandHeart className="w-[56%]" />
    </span>
  )
}

/* Figma icon assets (public/assets) */
const Ico = ({ f, className = 'size-6' }: { f: string; className?: string }) => <img src={`/assets/${f}`} alt="" aria-hidden className={cx('shrink-0', className)} />
/** PNG glyphs tinted with currentColor via mask, so they follow active/inactive states. */
const MaskIco = ({ f, className = 'size-[25px]' }: { f: string; className?: string }) => (
  <span aria-hidden className={cx('inline-block shrink-0 bg-current', className)} style={{ WebkitMask: `url(/assets/${f}) center/contain no-repeat`, mask: `url(/assets/${f}) center/contain no-repeat` }} />
)

/* ───────────────────────── likes context: the one-way like ───────────────────────── */
type Rsvp = null | { accept: boolean; name: string; seats: number; ticket: string }
type Ctx = {
  liked: Set<string>
  toggle: (id: string, label: string) => void
  rsvp: Rsvp
  setRsvp: (r: Rsvp) => void
  toast: string | null
}
const LikesCtx = createContext<Ctx>(null!)
const useLikes = () => useContext(LikesCtx)

export const PROMPTS: Record<string, string> = {
  quote: 'A line we live by',
  story: 'How we met',
  day: 'Find us on the day',
  attire: 'Dress like',
  party: 'Our people',
  photos: 'Snapshots',
  faq: 'Ask us about',
  gift: 'If you want to spoil us',
}
const TOTAL = Object.keys(PROMPTS).length

const LOVE = ['❤️', '💕', '💗', '💖', '💘']
type HeartDrop = { id: number; x: number; y: number; dx: number; rot: number; delay: number; size: number; fall: number; emoji: string }
let heartSeq = 0
function dropHearts(x: number, y: number, count = 7) {
  const wide = count > 10
  const hearts: HeartDrop[] = Array.from({ length: count }, () => ({
    id: ++heartSeq,
    x,
    y,
    dx: (Math.random() - 0.5) * (wide ? 200 : 90),
    rot: (Math.random() - 0.5) * 50,
    delay: Math.random() * (wide ? 0.28 : 0.16),
    size: wide ? 22 + Math.random() * 16 : 16 + Math.random() * 12,
    fall: wide ? 190 + Math.random() * 70 : 90 + Math.random() * 50,
    emoji: LOVE[Math.floor(Math.random() * LOVE.length)],
  }))
  window.dispatchEvent(new CustomEvent('nr-hearts', { detail: hearts }))
}
function dropFrom(el: HTMLElement, count = 7) {
  const r = el.getBoundingClientRect()
  dropHearts(r.left + r.width / 2, r.top + r.height / 2, count)
}

function HeartRain() {
  const [items, setItems] = useState<HeartDrop[]>([])
  useEffect(() => {
    const on = (e: Event) => {
      const next = (e as CustomEvent<HeartDrop[]>).detail
      setItems((cur) => [...cur, ...next])
      window.setTimeout(() => {
        const ids = new Set(next.map((h) => h.id))
        setItems((cur) => cur.filter((h) => !ids.has(h.id)))
      }, 1900)
    }
    window.addEventListener('nr-hearts', on)
    return () => window.removeEventListener('nr-hearts', on)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {items.map((h) => (
        <span
          key={h.id}
          className="heart-drop absolute"
          style={{ left: h.x, top: h.y, fontSize: h.size, animationDelay: `${h.delay}s`, ['--dx' as string]: `${h.dx}px`, ['--rot' as string]: `${h.rot}deg`, ['--fall' as string]: `${h.fall}px` }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}

function LikesProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem('nr-liked') || '[]')))
  const [rsvp, setRsvpS] = useState<Rsvp>(() => JSON.parse(localStorage.getItem('nr-rsvp') || 'null'))
  const [toast, setToast] = useState<string | null>(null)
  const t = useRef<number>(0)
  useEffect(() => localStorage.setItem('nr-liked', JSON.stringify([...liked])), [liked])
  const toggle = (id: string, label: string) => {
    const n = new Set(liked)
    if (n.has(id)) n.delete(id)
    else {
      n.add(id)
      setToast(`You liked “${label}…”`)
      clearTimeout(t.current)
      t.current = window.setTimeout(() => setToast(null), 2200)
    }
    setLiked(n)
  }
  const setRsvp = (r: Rsvp) => {
    setRsvpS(r)
    localStorage.setItem('nr-rsvp', JSON.stringify(r))
  }
  return <LikesCtx.Provider value={{ liked, toggle, rsvp, setRsvp, toast }}>{children}</LikesCtx.Provider>
}

/* ───────────────────────── primitives ───────────────────────── */
const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

function Pill({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'shrink-0 rounded-full px-4 h-9 text-[14px] font-medium transition-colors duration-300 active:scale-95',
        active ? 'bg-violet text-white' : 'bg-white text-ink ring-1 ring-line hover:bg-canvas',
        className,
      )}
    >
      {children}
    </button>
  )
}

function CircleBtn({ kind, size = 'md', onClick, label, className, active }: { kind: 'x' | 'heart'; size?: 'sm' | 'md' | 'lg'; onClick?: (el: HTMLElement) => void; label: string; className?: string; active?: boolean }) {
  const [k, setK] = useState(0)
  const s = { sm: 'size-10', md: 'size-14', lg: 'size-20' }[size]
  const ic = { sm: 'size-5', md: 'size-7', lg: 'size-9' }[size]
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        setK((v) => v + 1)
        onClick?.(e.currentTarget)
      }}
      className={cx(
        s,
        'grid place-items-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,.14)] transition-transform duration-200 ease-out active:scale-[.88] hover:scale-105',
        kind === 'x' ? 'bg-white text-mute' : 'bg-violet text-white',
        active && kind === 'x' && 'ring-4 ring-ink/10',
        active && kind === 'heart' && 'ring-4 ring-violet/25',
        className,
      )}
    >
      <span key={k} className={cx(k > 0 && 'anim-pop', 'grid')}>
        {kind === 'x' ? <Ico f="db413.svg" className={ic} /> : <BrandHeart className={ic} />}
      </span>
    </button>
  )
}

function IconWell({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp onClick={onClick} className="group flex w-[68px] shrink-0 flex-col items-center gap-1.5">
      <span
        className={cx(
          'grid size-12 place-items-center rounded-full transition-all duration-300 group-active:scale-90',
          active ? 'bg-violet text-white' : 'bg-well text-mute',
        )}
      >
        {icon}
      </span>
      <span className={cx('text-center text-[11px] leading-tight font-medium', active ? 'text-violet' : 'text-mute')}>{label}</span>
    </Comp>
  )
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (el.classList.add('in'), io.disconnect()), { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

/** Each section is a prompt card on the couple's profile, with its own like-heart. */
function PromptCard({ id, answer, children, className, bare }: { id: string; answer?: ReactNode; children?: ReactNode; className?: string; bare?: boolean }) {
  const ref = useReveal<HTMLElement>()
  const { liked, toggle, rsvp } = useLikes()
  const on = liked.has(id)
  const [k, setK] = useState(0)
  return (
    <section id={id} ref={ref} className={cx('reveal relative', className)}>
      <div className={cx('relative rounded-[28px] bg-white', !bare && 'p-6 md:p-10', 'shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)]')}>
        {!bare && (
          <>
            <p className="text-[13px] font-medium text-mute">{PROMPTS[id]}…</p>
            {answer && <h2 className="mt-1.5 max-w-2xl text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[34px]">{answer}</h2>}
          </>
        )}
        {children}
      </div>
      <button
        aria-label={on ? 'Unlike' : 'Like this'}
        disabled={!!rsvp}
        onClick={(e) => {
          setK((v) => v + 1)
          if (!on) dropFrom(e.currentTarget)
          toggle(id, PROMPTS[id])
        }}
        className={cx(
          'absolute -right-2 -bottom-3 z-10 grid size-12 place-items-center rounded-full shadow-[0_6px_18px_rgba(0,0,0,.16)] transition-all duration-300 active:scale-[.88] md:-right-4',
          on ? 'bg-violet text-white' : 'bg-white text-violet hover:scale-105',
        )}
      >
        <span key={k} className={cx(k > 0 && 'anim-pop', 'grid')}>
          <BrandHeart className="size-6" hi={on ? '#AD9FDF' : '#F6F4FD'} />
        </span>
      </button>
    </section>
  )
}

/* ───────────────────────── 1. Entrance ───────────────────────── */
function Entrance({ onOpen, onStart }: { onOpen: () => void; onStart: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const go = (el: HTMLElement) => {
    onStart()
    dropFrom(el, 8)
    setLeaving(true)
    setTimeout(onOpen, 650)
  }
  return (
    <div className={cx('fixed inset-0 z-50 bg-canvas transition-colors duration-500', leaving && 'bg-transparent pointer-events-none')}>
      <div
        className="absolute inset-0 overflow-hidden md:inset-6 md:rounded-[36px]"
        style={leaving ? { animation: 'slideL .65s cubic-bezier(.5,0,.75,0) forwards' } : undefined}
      >
        <img src={PHOTOS[0]} alt="Nick and Rizelle (placeholder photo)" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/60" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white md:p-6">
          <button aria-label="Back" className="grid size-10 place-items-center rounded-full bg-black/20 backdrop-blur-md active:scale-90"><I.back className="size-6" /></button>
          <div className="flex gap-2">
            <button aria-label="Settings" className="grid size-10 place-items-center rounded-full bg-black/20 backdrop-blur-md active:scale-90"><I.gear /></button>
            <button aria-label="More" className="grid size-10 place-items-center rounded-full bg-black/20 backdrop-blur-md active:scale-90"><I.more className="size-6" /></button>
          </div>
        </div>

        {/* the notification: they liked you first */}
        <div className="anim-drop absolute inset-x-4 top-20 mx-auto flex max-w-md items-center gap-3 rounded-[22px] bg-white/80 p-3 pr-4 shadow-xl backdrop-blur-xl [animation-delay:.5s]">
          <div className="relative flex shrink-0">
            <img src={PHOTOS[2]} alt="" className="size-11 rounded-full object-cover ring-2 ring-white" />
            <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-violet text-white ring-2 ring-white"><BrandHeart className="size-3" /></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-snug"><b className="font-extrabold">Nick &amp; Rizelle</b> liked you</p>
            <p className="text-[12px] text-mute">Dating · now</p>
          </div>
          <span className="size-2.5 rounded-full bg-violet" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-10">
          <div className="anim-rise mx-auto max-w-xl [animation-delay:.9s]">
            <span className="inline-flex h-7 items-center rounded-full bg-violet px-3 text-[12px] font-medium">Getting married</span>
            <h1 className="mt-3 text-[44px] leading-[1] font-extrabold tracking-[-0.03em] md:text-[72px]">Nick &amp; Rizelle</h1>
            <p className="mt-2 text-[15px] text-white/85">{DATE_LABEL} · {CITY}</p>
            <button
              onClick={(e) => go(e.currentTarget)}
              className="mt-6 flex h-14 w-full items-center justify-between rounded-full bg-white/75 pr-2 pl-6 text-[16px] font-medium text-ink shadow-lg backdrop-blur-xl transition active:scale-[.98] hover:bg-white/85"
            >
              See why they liked you
              <span className="grid size-10 place-items-center rounded-full bg-violet text-white"><I.arrow /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── 2. Pill bar + Match Meter ───────────────────────── */
const NAV = [
  ['story', 'Story'],
  ['day', 'The day'],
  ['attire', 'Attire'],
  ['party', 'People'],
  ['photos', 'Photos'],
  ['faq', 'FAQ'],
  ['gift', 'Gifts'],
] as const

function MatchMeter() {
  const { liked, rsvp } = useLikes()
  const R = 19
  const C = 2 * Math.PI * R
  // likes fill up to 90%; only a reply closes it.
  const frac = rsvp ? 1 : (liked.size / TOTAL) * 0.9
  const color = rsvp && !rsvp.accept ? '#bcc0c4' : '#7c5ddb'
  return (
    <div className="flex items-center" title={rsvp ? 'Matched' : `${liked.size}/${TOTAL} liked — reply to match`}>
      <div className={cx('flex transition-all duration-700', rsvp?.accept ? '-mr-1' : 'mr-1')}>
        <span className="z-10 grid size-9 place-items-center rounded-full bg-ink text-[12px] font-extrabold text-white ring-2 ring-white">N</span>
        <span className="-ml-2.5 grid size-9 place-items-center rounded-full bg-violet text-[12px] font-extrabold text-white ring-2 ring-white">R</span>
      </div>
      <div className="relative grid size-11 place-items-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r={R} fill="none" stroke="#e4e6eb" strokeWidth="2.5" strokeDasharray={rsvp ? undefined : '3 3'} />
          <circle
            cx="22" cy="22" r={R} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
            style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke .5s' }}
          />
        </svg>
        {rsvp ? (
          <span key="g" className={cx('anim-drop grid size-8 place-items-center rounded-full text-[12px] font-extrabold text-white', rsvp.accept ? 'bg-violet' : 'bg-[#bcc0c4]')}>
            {rsvp.name.trim()[0]?.toUpperCase() || 'Y'}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-mute">You</span>
        )}
      </div>
    </div>
  )
}

function PillBar() {
  const [active, setActive] = useState('')
  const { rsvp } = useLikes()
  useEffect(() => {
    const ids = [...NAV.map((n) => n[0]), 'reply']
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((i) => document.getElementById(i) && io.observe(document.getElementById(i)!))
    return () => io.disconnect()
  }, [])
  return (
    <header className="anim-drop fixed inset-x-0 top-3 z-40 px-3">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 rounded-full bg-white/85 p-1.5 pl-2 shadow-[0_4px_24px_rgba(0,0,0,.08)] ring-1 ring-black/5 backdrop-blur-xl">
        <a href="#top" aria-label="Top"><MatchMeter /></a>
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto px-1">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={cx(
                'shrink-0 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-300',
                active === id ? 'bg-well text-violet' : 'text-mute hover:text-ink',
              )}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="#reply"
          className={cx(
            'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium text-white transition active:scale-95',
            rsvp && !rsvp.accept ? 'bg-mute' : 'bg-violet hover:bg-violet-deep',
          )}
        >
          {rsvp ? (<><I.check className="size-4" />{rsvp.accept ? 'Matched' : 'Replied'}</>) : (<><BrandHeart className="size-4" />Reply</>)}
        </a>
      </nav>
    </header>
  )
}

/* ───────────────────────── 3. Hero ───────────────────────── */
function useCountdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const d = Math.max(0, WEDDING_DATE.getTime() - now)
  return [
    [Math.floor(d / 864e5), 'days'],
    [Math.floor((d / 36e5) % 24), 'hrs'],
    [Math.floor((d / 6e4) % 60), 'min'],
    [Math.floor((d / 1e3) % 60), 'sec'],
  ] as const
}

function Hero() {
  const [order, setOrder] = useState([1, 3, 5])
  const [out, setOut] = useState<null | 'l' | 'r'>(null)
  const cd = useCountdown()
  const shuffle = (dir: 'l' | 'r') => {
    if (out) return
    setOut(dir)
    setTimeout(() => {
      setOrder((o) => [o[1], o[2], o[0]])
      setOut(null)
    }, 380)
  }
  return (
    <section id="top" className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-28 pb-10 md:grid-cols-[1fr_1.05fr] md:gap-16 md:pt-36">
      <div className="relative mx-auto h-[440px] w-full max-w-[340px] md:h-[520px] md:max-w-[400px]">
        {order.map((p, i) => {
          const pos = [
            'rotate-0 z-30',
            '-rotate-6 -translate-x-6 translate-y-3 scale-[.95] z-20',
            'rotate-6 translate-x-6 translate-y-5 scale-[.9] z-10',
          ][i]
          const flying = i === 0 && out
          return (
            <div
              key={p}
              className={cx('absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,.18)] transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]', pos)}
              style={flying ? { transform: `translateX(${out === 'l' ? '-120%' : '120%'}) rotate(${out === 'l' ? -16 : 16}deg)`, opacity: 0, transition: 'all .38s cubic-bezier(.5,0,.75,0)' } : undefined}
            >
              <img src={PHOTOS[p]} alt="Couple photo placeholder" className="size-full object-cover" />
              {i === 0 && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 text-white">
                  <span className="rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-medium text-ink backdrop-blur-xl">Photo {order[0]} of {PHOTOS.length}</span>
                </div>
              )}
            </div>
          )
        })}
        <div className="absolute -bottom-7 left-1/2 z-40 flex -translate-x-1/2 gap-5">
          <CircleBtn kind="x" label="Next photo" onClick={() => shuffle('l')} />
          <CircleBtn kind="heart" label="Like photo" onClick={(el) => { dropFrom(el); shuffle('r') }} />
        </div>
      </div>

      <div className="anim-rise text-center md:text-left [animation-delay:.15s]">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-violet px-3.5 text-[13px] font-medium text-white"><Ico f="df0db.svg" />Getting married</span>
        <h1 className="mt-4 text-[52px] leading-[.95] font-extrabold tracking-[-0.035em] md:text-[84px]">Nick &amp;<br />Rizelle</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px] text-mute md:justify-start">
          <span className="flex items-center gap-1.5"><Ico f="34e83.svg" />{DATE_LABEL}</span>
          <span className="flex items-center gap-1.5"><Ico f="1f091.svg" />{CITY}</span>
          <span className="flex items-center gap-1.5"><Ico f="5f98a.svg" />Met on Dating</span>
        </div>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-mute md:mx-0">
          We liked you first. Scroll through our profile, heart the parts you love, then like us back to make it a match.
        </p>
        <div className="mt-8 flex justify-center gap-3 md:justify-start">
          {cd.map(([n, l]) => (
            <div key={l} className="flex w-[72px] flex-col items-center rounded-[16px] bg-violet py-3 text-white">
              <span className="text-[26px] font-extrabold tabular-nums tracking-tight">{String(n).padStart(2, '0')}</span>
              <span className="text-[11px] font-medium">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── 4–11 sections ───────────────────────── */
function Quote() {
  return (
    <PromptCard id="quote" className="mx-auto max-w-3xl">
      <blockquote className="mt-3 text-[22px] leading-snug font-medium tracking-[-0.01em] md:text-[28px]">
        “[Short quote placeholder — a line about choosing each other, every day, on purpose.]”
      </blockquote>
      <p className="mt-4 text-[13px] text-mute">— [Source placeholder]</p>
    </PromptCard>
  )
}

function Story() {
  return (
    <PromptCard id="story" bare className="mx-auto max-w-6xl">
      <div className="grid overflow-hidden md:grid-cols-2">
        <div className="relative m-3 h-[380px] overflow-hidden rounded-[22px] md:h-auto md:min-h-[520px]">
          <img src={PHOTOS[4]} alt="Story photo placeholder" className="absolute inset-0 size-full object-cover" />
          <span className="absolute top-4 left-4 rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-medium backdrop-blur-xl">Their first photo together</span>
        </div>
        <div className="relative p-6 md:p-12">
          <span aria-hidden className="pointer-events-none absolute -top-2 right-4 text-[120px] leading-none font-extrabold tracking-[-0.06em] text-well select-none md:text-[180px]">20XX</span>
          <div className="relative">
            <p className="text-[13px] font-medium text-mute">{PROMPTS.story}…</p>
            <h2 className="mt-1.5 text-[30px] leading-[1.1] font-extrabold tracking-[-0.02em] md:text-[40px]">A like, a reply, and then every day after.</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-mute">
              [Story placeholder] Nick saw Rizelle’s profile on Facebook Dating in [month, year]. He answered one of her prompts, she wrote back, and the conversation never really stopped.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-mute">
              [Second paragraph placeholder — the first date, the moment they knew, the proposal at [place].]
            </p>
            <div className="mt-8 flex gap-1 overflow-x-auto no-scrollbar">
              <IconWell icon={<Ico f="d7d7b.svg" className="h-[23px] w-[25px]" />} label="The like" />
              <IconWell icon={<Ico f="84fc6.svg" className="size-[31px]" />} label="First message" />
              <IconWell icon={<Ico f="24833.svg" className="size-[39px]" />} label="First date" />
              <IconWell icon={<Ico f="d0a82.svg" className="size-12" />} label="The yes" />
            </div>
          </div>
        </div>
      </div>
    </PromptCard>
  )
}

function Venue({ kind, name, time, img: src }: { kind: string; name: string; time: string; img: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] bg-canvas">
      <div className="relative h-56 md:h-64">
        <iframe
          title={`${kind} map`}
          className="size-full grayscale-[.4]"
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=120.97%2C14.55%2C121.03%2C14.60&layer=mapnik"
        />
        <img src={src} alt="" className="absolute bottom-3 left-3 size-16 rounded-2xl object-cover ring-4 ring-white" />
        <span className="absolute top-3 right-3 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-medium backdrop-blur-xl">Map placeholder</span>
      </div>
      <div className="p-5">
        <span className="inline-flex h-7 items-center rounded-full bg-violet px-3 text-[12px] font-medium text-white">{kind}</span>
        <h3 className="mt-3 text-[22px] font-extrabold tracking-[-0.01em]">{name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-[14px] text-mute"><Ico f="1f091.svg" />[Street address], {CITY}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[14px] text-mute"><Ico f="34e83.svg" />{time}</p>
        <a href="#" className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-medium ring-1 ring-line transition hover:bg-well active:scale-95">
          <Ico f="e8857.svg" />Directions
        </a>
      </div>
    </div>
  )
}

function Day() {
  return (
    <PromptCard id="day" answer="Two places, one long, happy day." className="mx-auto max-w-6xl">
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Venue kind="Ceremony" name="[Ceremony venue]" time="[Date] · 3:00 PM" img={img('1519741497674-611481863552', 300)} />
        <Venue kind="Reception" name="[Reception venue]" time="[Date] · 6:00 PM" img={img('1464366400600-7168b8af9bc3', 300)} />
      </div>
    </PromptCard>
  )
}

const SWATCHES = {
  guests: {
    colors: [['#9caf88', 'Sage'], ['#d8a7a0', 'Dusty rose'], ['#e9d8b4', 'Champagne'], ['#a89584', 'Taupe'], ['#2f3e5c', 'Navy']],
    notes: ['Semi-formal: dresses, suits, or barong.', 'Please avoid white and ivory — those are for the bride.', 'Comfortable shoes for the garden reception.'],
  },
  sponsors: {
    colors: [['#e9d8b4', 'Champagne'], ['#c9b8a6', 'Oat'], ['#f4efe6', 'Cream'], ['#7d6b5d', 'Mocha']],
    notes: ['Ladies: floor-length gown in champagne or oat.', 'Gentlemen: barong tagalog or a cream suit, dark trousers.', 'Final fitting details will be sent by [coordinator].'],
  },
} as const

function Attire() {
  const [tab, setTab] = useState<'guests' | 'sponsors'>('guests')
  const s = SWATCHES[tab]
  return (
    <PromptCard id="attire" answer="Soft earth tones, garden-party easy." className="mx-auto max-w-6xl">
      <div className="mt-6 flex gap-2">
        <Pill active={tab === 'guests'} onClick={() => setTab('guests')}>Guests</Pill>
        <Pill active={tab === 'sponsors'} onClick={() => setTab('sponsors')}>Sponsors</Pill>
      </div>
      <div key={tab} className="anim-fade mt-8 grid gap-8 md:grid-cols-2">
        <div className="flex flex-wrap gap-5">
          {s.colors.map(([c, n]) => (
            <div key={n} className="flex flex-col items-center gap-2">
              <span className="size-16 rounded-full shadow-inner ring-4 ring-canvas md:size-20" style={{ background: c }} />
              <span className="text-[12px] font-medium text-mute">{n}</span>
            </div>
          ))}
        </div>
        <ul className="space-y-3">
          {s.notes.map((n) => (
            <li key={n} className="flex gap-3 rounded-[18px] bg-canvas p-4 text-[15px] text-ink">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet"><Ico f="1f9cb.svg" className="size-[19px]" /></span>
              <span className="pt-1">{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </PromptCard>
  )
}

const PARTY: { id: string; label: string; icon: ReactNode; people: [string, string][] }[] = [
  { id: 'couple', label: 'Couple', icon: <MaskIco f="bb73e.png" />, people: [['Nick [Surname]', 'Groom'], ['Rizelle [Surname]', 'Bride']] },
  { id: 'parents', label: 'Parents', icon: <MaskIco f="63cfb.png" />, people: [["[Groom's father]", 'Father of the groom'], ["[Groom's mother]", 'Mother of the groom'], ["[Bride's father]", 'Father of the bride'], ["[Bride's mother]", 'Mother of the bride']] },
  { id: 'principal', label: 'Principal', icon: <MaskIco f="f3d9b.png" />, people: [['[Sponsor name]', 'Principal sponsor'], ['[Sponsor name]', 'Principal sponsor'], ['[Sponsor name]', 'Principal sponsor'], ['[Sponsor name]', 'Principal sponsor']] },
  { id: 'secondary', label: 'Secondary', icon: <MaskIco f="f5390.png" />, people: [['[Name]', 'Candle'], ['[Name]', 'Veil'], ['[Name]', 'Cord']] },
  { id: 'party', label: 'Wedding party', icon: <MaskIco f="d7d7b.svg" className="h-[23px] w-[25px]" />, people: [['[Name]', 'Best man'], ['[Name]', 'Maid of honor'], ['[Name]', 'Groomsman'], ['[Name]', 'Bridesmaid']] },
  { id: 'little', label: 'Little ones', icon: <MaskIco f="3a1aa.png" />, people: [['[Name]', 'Ring bearer'], ['[Name]', 'Coin bearer'], ['[Name]', 'Flower girl']] },
]

function Party() {
  const [g, setG] = useState(0)
  const grp = PARTY[g]
  return (
    <PromptCard id="party" answer="The people who got us here." className="mx-auto max-w-6xl">
      <div className="no-scrollbar mt-6 -mx-2 flex gap-1 overflow-x-auto px-2 pb-1">
        {PARTY.map((p, i) => (
          <IconWell key={p.id} icon={p.icon} label={p.label} active={g === i} onClick={() => setG(i)} />
        ))}
      </div>
      <div key={grp.id} className="anim-fade mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grp.people.map(([n, r], i) => (
          <div key={i} className="anim-rise flex items-center gap-3 rounded-[20px] bg-white p-3 ring-1 ring-line" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-well text-[16px] font-extrabold text-violet">{n.replace(/[^A-Za-z]/g, '')[0] || '•'}</span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold">{n}</p>
              <p className="text-[13px] text-mute">{r}</p>
            </div>
          </div>
        ))}
      </div>
    </PromptCard>
  )
}

function Photos() {
  const [stack, setStack] = useState(PHOTOS.map((_, i) => i))
  const [drag, setDrag] = useState({ x: 0, on: false })
  const [fly, setFly] = useState<0 | 1 | -1>(0)
  const [open, setOpen] = useState<number | null>(null)
  const start = useRef(0)
  const moved = useRef(false)
  const send = (dir: 1 | -1) => {
    if (fly) return
    setFly(dir)
    setTimeout(() => {
      setStack((s) => [...s.slice(1), s[0]])
      setFly(0)
      setDrag({ x: 0, on: false })
    }, 340)
  }
  return (
    <PromptCard id="photos" answer="A few favorites. Swipe through." className="mx-auto max-w-6xl">
      <div className="mt-8 grid items-center gap-10 md:grid-cols-[1fr_auto]">
        <div className="relative mx-auto h-[460px] w-full max-w-[360px] select-none">
          {stack.slice(0, 3).reverse().map((p, ri) => {
            const i = 2 - ri
            const top = i === 0
            const tx = top ? (fly ? fly * 520 : drag.x) : 0
            return (
              <div
                key={p}
                className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-[28px] bg-canvas shadow-[0_12px_36px_rgba(0,0,0,.16)] active:cursor-grabbing"
                style={{
                  transform: top ? `translateX(${tx}px) rotate(${tx / 18}deg)` : `translateY(${i * 14}px) scale(${1 - i * 0.05})`,
                  transition: drag.on && top ? 'none' : 'transform .4s cubic-bezier(.2,.8,.2,1)',
                  zIndex: 10 - i,
                }}
                onPointerDown={top ? (e) => { start.current = e.clientX; moved.current = false; setDrag({ x: 0, on: true }); (e.target as HTMLElement).setPointerCapture(e.pointerId) } : undefined}
                onPointerMove={top ? (e) => { if (!drag.on) return; const x = e.clientX - start.current; if (Math.abs(x) > 6) moved.current = true; setDrag({ x, on: true }) } : undefined}
                onPointerUp={top ? (e) => { if (Math.abs(drag.x) > 110) { if (drag.x > 0) dropFrom(e.currentTarget); send(drag.x > 0 ? 1 : -1) } else { setDrag({ x: 0, on: false }); if (!moved.current) setOpen(p) } } : undefined}
              >
                <img src={PHOTOS[p]} alt="Gallery placeholder" draggable={false} className="pointer-events-none size-full object-cover" />
                {top && (
                  <>
                    <span className="absolute top-4 left-4 rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-medium backdrop-blur-xl">Tap to open · {p + 1}/{PHOTOS.length}</span>
                    <span className="absolute top-5 right-5 rounded-full bg-violet px-3 py-1 text-[13px] font-extrabold text-white transition-opacity" style={{ opacity: Math.max(0, drag.x / 110) }}>LOVE</span>
                  </>
                )}
              </div>
            )
          })}
          <div className="absolute -bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-5">
            <CircleBtn kind="x" label="Skip photo" onClick={() => send(-1)} />
            <CircleBtn kind="heart" label="Love photo" onClick={(el) => { dropFrom(el); send(1) }} />
          </div>
        </div>
        <div className="hidden max-w-xs space-y-3 md:block">
          {stack.slice(0, 4).map((p) => (
            <button key={p} onClick={() => setOpen(p)} className="flex w-full items-center gap-3 rounded-[18px] p-2 text-left transition hover:bg-canvas">
              <img src={PHOTOS[p]} alt="" className="size-14 rounded-2xl object-cover" />
              <span className="text-[14px] font-medium">[Caption placeholder {p + 1}]</span>
            </button>
          ))}
        </div>
      </div>
      {open !== null && (
        <div className="anim-fade fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal>
          <div className="anim-rise relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white" onClick={(e) => e.stopPropagation()}>
            <img src={PHOTOS[open]} alt="Enlarged photo" className="max-h-[78vh] w-full object-cover" />
            <div className="flex items-center justify-between p-4">
              <p className="text-[15px] font-medium">[Caption placeholder {open + 1}]</p>
              <span className="text-[13px] text-mute">{open + 1} / {PHOTOS.length}</span>
            </div>
            <CircleBtn kind="x" size="sm" label="Close" onClick={() => setOpen(null)} className="absolute top-4 right-4" />
          </div>
        </div>
      )}
    </PromptCard>
  )
}

const FAQS = [
  ['Can I bring a plus-one?', "Your invitation shows the number of seats we've saved for you. We'd love to keep it to that."],
  ['Are kids welcome?', '[Placeholder] Only the little ones in our entourage, so parents can enjoy the night.'],
  ['Is there parking?', '[Placeholder] Yes, free parking at both venues. Valet at the reception.'],
  ['Can I take photos during the ceremony?', "We're having an unplugged ceremony. Our photographer has it covered. Snap away at the reception!"],
  ['When should I RSVP?', 'By [RSVP deadline placeholder]. Just like us back at the bottom of this page.'],
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <PromptCard id="faq" answer="Anything. Here are the usual ones." className="mx-auto max-w-3xl">
      <div className="mt-6 space-y-2">
        {FAQS.map(([q, a], i) => {
          const on = open === i
          return (
            <div key={q} className={cx('rounded-[20px] transition-colors', on ? 'bg-canvas' : 'bg-white ring-1 ring-line')}>
              <button onClick={() => setOpen(on ? null : i)} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={on}>
                <span className="flex-1 text-[15px] font-medium">{q}</span>
                <span className="grid size-8 place-items-center rounded-full bg-well text-mute">
                  <I.down className={cx('size-4 transition-transform duration-300', on && 'rotate-180')} />
                </span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-[15px] leading-relaxed text-mute">{a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PromptCard>
  )
}

function Gift() {
  return (
    <PromptCard id="gift" className="mx-auto max-w-3xl">
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-well text-violet"><I.gift className="size-8" /></span>
        <div>
          <h2 className="text-[26px] leading-tight font-extrabold tracking-[-0.02em]">Your presence is the gift.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-mute">
            If you'd like to give something more, a contribution toward our first home together would mean the world. [Bank / e-wallet details placeholder]
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-canvas px-4 py-2 text-[13px] font-medium text-mute">[Account name] · [Account number]</div>
        </div>
      </div>
    </PromptCard>
  )
}

/* ───────────────────────── 12. Reply — liking them back ───────────────────────── */
type Wish = { name: string; text: string; when: string }
const SEED: Wish[] = [
  { name: '[Guest name]', text: 'Swiped right on this invite immediately. So happy for you two!', when: '2d' },
  { name: '[Guest name]', text: 'From a Dating chat to forever. See you there 💜', when: '4d' },
  { name: '[Guest name]', text: 'Already practicing my dance moves.', when: '1w' },
]

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-mute">{label}</span>
      {children}
    </label>
  )
}
const inputCls = 'h-12 w-full rounded-[16px] bg-canvas px-4 text-[15px] outline-none ring-violet transition focus:bg-white focus:ring-2'

function Reply() {
  const { rsvp, setRsvp } = useLikes()
  const [f, setF] = useState({ name: '', email: '', mobile: '', msg: '' })
  const [accept, setAccept] = useState<boolean | null>(null)
  const [seats, setSeats] = useState(1)
  const [err, setErr] = useState('')
  const [wishes, setWishes] = useState<Wish[]>(() => JSON.parse(localStorage.getItem('nr-wishes') || 'null') || SEED)
  const [sheet, setSheet] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const ref = useReveal<HTMLElement>()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!f.name.trim() || !/\S+@\S+\.\S+/.test(f.email)) return setErr('Add your name and a valid email.')
    if (accept === null) return setErr('Tap the heart or the X to reply.')
    setErr('')
    if (accept) {
      const btn = (e.nativeEvent as SubmitEvent).submitter
      if (btn instanceof HTMLElement) dropFrom(btn, 18)
    }
    const r = { accept, name: f.name, seats: accept ? seats : 0, ticket: `NR-${Math.floor(100 + Math.random() * 900)}` }
    setRsvp(r)
    if (f.msg.trim()) {
      const w = [{ name: f.name, text: f.msg.trim(), when: 'now' }, ...wishes]
      setWishes(w)
      localStorage.setItem('nr-wishes', JSON.stringify(w))
    }
    setTimeout(() => setSheet(true), 400)
  }

  return (
    <section id="reply" ref={ref} className="reveal mx-auto max-w-6xl">
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)] md:p-10">
          <p className="text-[13px] font-medium text-mute">Your turn</p>
          <h2 className="mt-1.5 text-[34px] leading-[1.05] font-extrabold tracking-[-0.025em] md:text-[44px]">Like them back?</h2>
          <p className="mt-2 text-[15px] text-mute">It's only a match when you reply. Kindly respond by [RSVP deadline].</p>

          {rsvp ? (
            <div className="anim-rise mt-8 rounded-[22px] bg-well p-5">
              <p className="text-[18px] font-extrabold">{rsvp.accept ? "It's a match 💜" : "We'll save you a slice."}</p>
              <p className="mt-1 text-[14px] text-mute">
                {rsvp.accept ? `${rsvp.seats} seat${rsvp.seats > 1 ? 's' : ''} saved for ${rsvp.name}. Ticket ${rsvp.ticket}.` : `Thank you for telling us, ${rsvp.name}. You'll be missed.`}
              </p>
              <div className="mt-4 flex gap-2">
                <Pill active onClick={() => setSheet(true)}>View match</Pill>
                <Pill onClick={() => setRsvp(null)}>Change reply</Pill>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="Full name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="[Your name]" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><input type="email" className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@email.com" /></Field>
                <Field label="Mobile"><input type="tel" className={inputCls} value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} placeholder="+63 9XX XXX XXXX" /></Field>
              </div>

              <div className="flex items-center justify-center gap-10 rounded-[22px] bg-canvas py-6">
                <div className="flex flex-col items-center gap-2">
                  <CircleBtn kind="x" size="lg" label="Can't make it" active={accept === false} onClick={() => setAccept(false)} className={cx(accept === true && 'opacity-50')} />
                  <span className={cx('text-[12px] font-medium', accept === false ? 'text-ink' : 'text-mute')}>Can't make it</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CircleBtn kind="heart" size="lg" label="I'm coming" active={accept === true} onClick={() => setAccept(true)} className={cx(accept === false && 'opacity-50')} />
                  <span className={cx('text-[12px] font-medium', accept === true ? 'text-violet' : 'text-mute')}>I'm coming</span>
                </div>
              </div>

              <div className={cx('grid transition-[grid-template-rows] duration-300', accept ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]')}>
                <div className="overflow-hidden">
                  <div className="flex items-center justify-between rounded-[16px] bg-canvas p-2 pl-4">
                    <span className="text-[15px] font-medium">Seats</span>
                    <div className="flex items-center gap-3">
                      <button type="button" aria-label="Fewer" onClick={() => setSeats((s) => Math.max(1, s - 1))} className="grid size-9 place-items-center rounded-full bg-white text-mute active:scale-90"><I.minus className="size-4" /></button>
                      <span className="w-5 text-center text-[17px] font-extrabold tabular-nums">{seats}</span>
                      <button type="button" aria-label="More" onClick={() => setSeats((s) => Math.min(4, s + 1))} className="grid size-9 place-items-center rounded-full bg-white text-mute active:scale-90"><I.plus className="size-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <Field label="Message for the couple">
                <textarea rows={3} className={cx(inputCls, 'h-auto py-3')} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} placeholder="Say something sweet…" />
              </Field>
              {err && <p className="anim-fade text-[13px] font-medium text-[#e41e3f]">{err}</p>}
              <button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-violet text-[16px] font-medium text-white transition hover:bg-violet-deep active:scale-[.98]">
                <BrandHeart className="size-5" />Confirm reply
              </button>
            </form>
          )}
        </div>

        {/* wishes: the messages under the match */}
        <div>
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="text-[17px] font-extrabold">Messages under the match</h3>
            <button onClick={() => setExpanded((v) => !v)} className="text-[13px] font-medium text-violet">{expanded ? 'Stack' : `See all ${wishes.length}`}</button>
          </div>
          <div className={cx('relative', !expanded && 'h-[300px]')}>
            {wishes.slice(0, expanded ? undefined : 4).map((w, i) => (
              <div
                key={`${w.name}-${w.text}-${i}`}
                onClick={() => setExpanded(true)}
                className={cx('anim-rise flex gap-3 rounded-[22px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,.06)] transition-all duration-500', expanded ? 'mb-3' : 'absolute inset-x-0 cursor-pointer')}
                style={expanded ? undefined : { top: i * 26, transform: `scale(${1 - i * 0.04})`, zIndex: 10 - i, opacity: 1 - i * 0.15 }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-well text-[14px] font-extrabold text-violet">{w.name.replace(/[^A-Za-z]/g, '')[0] || 'G'}</span>
                <div className="min-w-0">
                  <p className="text-[14px]"><b className="font-extrabold">{w.name}</b> <span className="text-mute">· {w.when}</span></p>
                  <p className="mt-0.5 text-[15px] leading-snug">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {sheet && rsvp && <MatchSheet onClose={() => setSheet(false)} />}
    </section>
  )
}

function MatchSheet({ onClose }: { onClose: () => void }) {
  const { rsvp, liked } = useLikes()
  if (!rsvp) return null
  const initial = rsvp.name.trim()[0]?.toUpperCase() || 'Y'
  const hearts = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return { dx: `${Math.cos(a) * 160}px`, dy: `${Math.sin(a) * 160}px`, d: `${(i % 4) * 60}ms` }
  })
  return (
    <div className="anim-fade fixed inset-0 z-[70] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="anim-rise relative w-full max-w-md overflow-hidden rounded-t-[32px] bg-white p-7 text-center sm:rounded-[32px]" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto mt-4 flex h-28 items-center justify-center">
          {rsvp.accept && hearts.map((h, i) => (
            <span key={i} className="absolute text-violet" style={{ ['--dx' as string]: h.dx, ['--dy' as string]: h.dy, animation: `burst 1.1s ${h.d} ease-out both` }}>
              <I.heart className="size-4" fill />
            </span>
          ))}
          <img src={PHOTOS[2]} alt="" className="relative z-10 size-24 -rotate-6 rounded-full object-cover ring-4 ring-white shadow-lg" />
          <span className={cx('relative -ml-5 grid size-24 rotate-6 place-items-center rounded-full text-[36px] font-extrabold text-white ring-4 ring-white shadow-lg', rsvp.accept ? 'bg-violet' : 'bg-[#bcc0c4]')}>{initial}</span>
          {rsvp.accept && <span className="absolute -bottom-2 z-20 grid place-items-center rounded-full bg-white p-1 shadow-md"><HeartMark className="size-11" /></span>}
        </div>
        <h3 className="mt-6 text-[30px] leading-tight font-extrabold tracking-[-0.02em]">{rsvp.accept ? "It's a match" : "We'll save you a slice"}</h3>
        <p className="mt-2 text-[15px] text-mute">
          {rsvp.accept ? `You and Nick & Rizelle liked each other. See you on ${DATE_LABEL.split(' ·')[0]}.` : "Thanks for replying. We'll raise a glass to you."}
        </p>

        {rsvp.accept && (
          <div className="mt-6 flex items-stretch overflow-hidden rounded-[20px] bg-well text-left">
            <div className="flex-1 p-4">
              <p className="text-[12px] font-medium text-mute">Guest</p>
              <p className="truncate text-[16px] font-extrabold">{rsvp.name}</p>
              <p className="mt-1 text-[12px] text-mute">{rsvp.seats} seat{rsvp.seats > 1 ? 's' : ''} · Table [TBA]</p>
            </div>
            <div className="flex flex-col justify-center border-l-2 border-dashed border-violet/30 px-5">
              <p className="text-[12px] font-medium text-mute">Ticket</p>
              <p className="text-[16px] font-extrabold text-violet">{rsvp.ticket}</p>
            </div>
          </div>
        )}

        {liked.size > 0 && (
          <div className="mt-5 text-left">
            <p className="text-[13px] font-medium text-mute">What you liked about us</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...liked].map((id) => (
                <span key={id} className="inline-flex h-8 items-center gap-1 rounded-full bg-canvas px-3 text-[13px] font-medium"><HeartMark className="size-5" />{PROMPTS[id]}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="mt-7 h-12 w-full rounded-full bg-violet text-[15px] font-medium text-white transition hover:bg-violet-deep active:scale-[.98]">
          {rsvp.accept ? 'Keep chatting' : 'Close'}
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────── 13. Closing + toast ───────────────────────── */
function Closing() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-28">
      <div className="flex flex-col items-center justify-between gap-4 rounded-full bg-white px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,.06)] sm:flex-row sm:pr-3">
        <div className="text-center sm:text-left">
          <p className="text-[17px] font-extrabold">Nick &amp; Rizelle</p>
          <p className="text-[13px] text-mute">Thanks for swiping right on our day. · {DATE_LABEL.split(' ·')[0]}</p>
        </div>
        <a href="#top" aria-label="Back to top" className="grid size-12 place-items-center rounded-full bg-violet text-white transition active:scale-90 hover:bg-violet-deep"><I.up className="size-5" /></a>
      </div>
    </footer>
  )
}

function Toast() {
  const { toast } = useLikes()
  if (!toast) return null
  return (
    <div key={toast + Date.now()} className="fixed bottom-24 left-1/2 z-50 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white shadow-xl" style={{ animation: 'toast 2.2s ease both' }}>
      <HeartMark className="size-5" />{toast}
    </div>
  )
}

/* ───────────────────────── song ───────────────────────── */
const SONG_SRC = '/fallen.mp3'

function MusicBar({ audioRef, playing, onToggle }: { audioRef: { current: HTMLAudioElement | null }; playing: boolean; onToggle: () => void }) {
  const [ratio, setRatio] = useState(0)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const tick = () => setRatio(audio.duration ? audio.currentTime / audio.duration : 0)
    audio.addEventListener('timeupdate', tick)
    return () => audio.removeEventListener('timeupdate', tick)
  }, [audioRef])
  const seek = (e: MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current
    if (!audio?.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * audio.duration
  }
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:justify-end md:px-6">
      <div className="w-full max-w-md rounded-[22px] bg-ink px-3 py-2.5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <img src="/fallen.webp" alt="" className={cx('disc size-10 shrink-0 rounded-full object-cover', playing && 'on')} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] leading-tight font-extrabold">Fallen</p>
            <p className="truncate text-[12px] text-white/60">Lola Amour</p>
          </div>
          <button type="button" onClick={onToggle} aria-label={playing ? 'Pause music' : 'Play music'} className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition active:scale-95">
            {playing
              ? <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z" /></svg>
              : <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>}
          </button>
        </div>
        <button type="button" aria-label="Song progress" onClick={seek} className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-white/20">
          <span className="block h-full rounded-full bg-violet" style={{ width: `${ratio * 100}%` }} />
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────── App ───────────────────────── */
export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [opened, setOpened] = useState(() => sessionStorage.getItem('nr-open') === '1')
  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden'
    if (opened) sessionStorage.setItem('nr-open', '1')
  }, [opened])
  const startSong = () => {
    const audio = audioRef.current
    if (!audio) return
    void audio.play().catch(() => setPlaying(false))
  }
  const toggleSong = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }
  return (
    <LikesProvider>
      <HeartRain />
      <audio ref={audioRef} src={SONG_SRC} preload="auto" loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      {!opened && <Entrance onOpen={() => setOpened(true)} onStart={startSong} />}
      {opened && (
        <>
          <PillBar />
          <main className="space-y-10 px-4 pb-16 md:space-y-14">
            <Hero />
            <Quote />
            <Story />
            <Day />
            <Attire />
            <Party />
            <Photos />
            <Faq />
            <Gift />
            <Reply />
          </main>
          <Closing />
          <MusicBar audioRef={audioRef} playing={playing} onToggle={toggleSong} />
          <Toast />
        </>
      )}
    </LikesProvider>
  )
}
