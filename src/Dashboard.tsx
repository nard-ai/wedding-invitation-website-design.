import { useEffect, useState, type FormEvent } from 'react'

const SAVED = 'nr-dashboard-pass'

type Reply = { name: string; email: string; mobile: string; accept: boolean; seats: number; ticket: string }
type Invite = { code: string; label: string; seats: number; reply: null | { name: string; accept: boolean; seats: number } }
type Board = { coming: number; declined: number; seats: number; replies: Reply[]; invites?: Invite[] }

async function openBoard(passphrase: string): Promise<Board> {
  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passphrase }),
  })
  const data = await res.json().catch(() => ({})) as { error?: string }
  if (!res.ok) throw new Error(data.error || 'Could not open the dashboard.')
  return data as Board
}

export default function Dashboard() {
  const [phrase, setPhrase] = useState('')
  const [board, setBoard] = useState<Board | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [label, setLabel] = useState('')
  const [seats, setSeats] = useState(2)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = 'Replies · Nick & Rizelle'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const saved = localStorage.getItem(SAVED)
    let live = true
    if (saved) {
      setBusy(true)
      void openBoard(saved).then(
        (next) => { if (live) setBoard(next) },
        () => { if (live) localStorage.removeItem(SAVED) },
      ).finally(() => { if (live) setBusy(false) })
    }
    return () => {
      live = false
      document.title = previous
      meta.remove()
    }
  }, [])

  async function unlock(passphrase: string, remembered = false) {
    setBusy(true)
    setErr('')
    try {
      const next = await openBoard(passphrase)
      localStorage.setItem(SAVED, passphrase)
      setBoard(next)
      setPhrase('')
    } catch (error) {
      if (remembered) localStorage.removeItem(SAVED)
      setBoard(null)
      setErr(error instanceof Error ? error.message : 'Could not open the dashboard.')
    } finally {
      setBusy(false)
    }
  }

  async function saveInvite(e: FormEvent) {
    e.preventDefault()
    const passphrase = localStorage.getItem(SAVED) || ''
    setSaving(true)
    setFormErr('')
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase, action: 'create', label, seats }),
      })
      const data = await res.json().catch(() => ({})) as Board & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not create that link.')
      setBoard(data)
      setLabel('')
      setSeats(2)
    } catch (error) {
      setFormErr(error instanceof Error ? error.message : 'Could not create that link.')
    } finally {
      setSaving(false)
    }
  }

  async function removeInvite(code: string) {
    const passphrase = localStorage.getItem(SAVED) || ''
    setFormErr('')
    const res = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase, action: 'remove', code }),
    })
    const data = await res.json().catch(() => ({})) as Board & { error?: string }
    if (!res.ok) {
      setFormErr(data.error || 'Could not remove that link.')
      return
    }
    setBoard(data)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void unlock(phrase)
  }

  const lock = () => {
    localStorage.removeItem(SAVED)
    setBoard(null)
    setErr('')
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <p className="text-[13px] font-medium text-mute">Nick &amp; Rizelle</p>
      <h1 className="mt-1 text-[32px] leading-tight font-extrabold tracking-[-0.03em]">Replies</h1>
      {!board ? (
        <form onSubmit={submit} className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)]">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-mute">Passphrase</span>
            <input
              type="password"
              autoComplete="current-password"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              className="h-12 w-full rounded-[16px] bg-canvas px-4 text-[15px] outline-none ring-violet transition focus:bg-white focus:ring-2"
            />
          </label>
          {err && <p className="mt-3 text-[14px] font-medium text-red-600">{err}</p>}
          <button type="submit" disabled={busy || !phrase.trim()} className="mt-4 h-12 w-full rounded-full bg-violet text-[15px] font-medium text-white transition hover:bg-violet-deep active:scale-[.98] disabled:opacity-70">
            {busy ? 'Opening…' : 'Open'}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={saveInvite} className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)]">
            <h2 className="text-[18px] font-extrabold">Invitation links</h2>
            <p className="mt-1 text-[14px] text-mute">One household, one link. They can reply for up to the seats you set, and not more.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-mute">Household</span>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Santos family" className="h-12 w-full rounded-[16px] bg-canvas px-4 text-[15px] outline-none ring-violet transition focus:bg-white focus:ring-2" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-mute">Seats</span>
                <input type="number" min={1} max={12} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="h-12 w-full rounded-[16px] bg-canvas px-4 text-[15px] outline-none ring-violet transition focus:bg-white focus:ring-2" />
              </label>
            </div>
            {formErr && <p className="mt-3 text-[14px] font-medium text-red-600">{formErr}</p>}
            <button type="submit" disabled={saving || !label.trim()} className="mt-4 h-12 rounded-full bg-violet px-6 text-[15px] font-medium text-white transition hover:bg-violet-deep active:scale-[.98] disabled:opacity-70">
              {saving ? 'Creating…' : 'Create link'}
            </button>
            <ul className="mt-5 divide-y divide-line">
              {(board.invites || []).length === 0 ? (
                <li className="py-3 text-[14px] text-mute">No links yet. The guest list can be added here when you have it.</li>
              ) : (board.invites || []).map((invite) => (
                <li key={invite.code} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[16px] font-extrabold">{invite.label}</p>
                    {!invite.reply && (
                      <button type="button" onClick={() => void removeInvite(invite.code)} className="text-[13px] font-medium text-mute">Remove</button>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-mute">
                    {invite.reply
                      ? invite.reply.accept
                        ? `${invite.reply.seats} of ${invite.seats} confirmed by ${invite.reply.name}`
                        : `${invite.reply.name} can't make it`
                      : `Waiting · ${invite.seats} ${invite.seats === 1 ? 'seat' : 'seats'}`}
                  </p>
                  <p className="mt-1 break-all text-[14px] text-violet">{`${window.location.origin}/?i=${invite.code}`}</p>
                </li>
              ))}
            </ul>
          </form>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="I'm coming" value={board.coming} />
            <Stat label="Can't make it" value={board.declined} />
            <Stat label="Seats saved" value={board.seats} />
          </div>
          <div className="mt-4 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)]">
            {board.replies.length === 0 ? (
              <p className="p-6 text-[15px] text-mute">No replies yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {board.replies.map((row) => (
                  <li key={row.ticket} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[16px] font-extrabold">{row.name}</p>
                      <span className={row.accept ? 'rounded-full bg-violet px-2.5 py-0.5 text-[12px] font-medium text-white' : 'rounded-full bg-canvas px-2.5 py-0.5 text-[12px] font-medium text-mute'}>
                        {row.accept ? "I'm coming" : "Can't make it"}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-mute">
                      {row.seats} {row.seats === 1 ? 'seat' : 'seats'} · {row.ticket}
                    </p>
                    <p className="mt-1 text-[14px] break-all">{row.email}</p>
                    <p className="text-[14px]">{row.mobile}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={lock} className="mt-4 text-[14px] font-medium text-mute">Lock</button>
        </>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_30px_rgba(0,0,0,.04)]">
      <p className="text-[13px] font-medium text-mute">{label}</p>
      <p className="mt-1 text-[36px] leading-none font-extrabold tracking-[-0.03em]">{value}</p>
    </div>
  )
}
