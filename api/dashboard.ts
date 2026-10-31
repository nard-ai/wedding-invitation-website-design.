import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function connectionString() {
  const raw = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '')
  const url = raw.replace(/([?&])channel_binding=[^&]*&?/g, '$1').replace(/[?&]$/, '')
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

function gate(given: string): 'ok' | 'no' | 'missing' {
  const expected = (process.env.DASHBOARD_PASSPHRASE || '').trim().replace(/^["']|["']$/g, '')
  if (!expected) return 'missing'
  const attempt = Buffer.from(given.trim())
  const secret = Buffer.from(expected)
  if (attempt.length !== secret.length || !timingSafeEqual(attempt, secret)) return 'no'
  return 'ok'
}

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

function makeCode() {
  const bytes = randomBytes(8)
  let code = ''
  for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  return code
}

function uniqueViolation(err: unknown) {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === '23505'
}

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>

async function board(sql: Sql) {
  const rows = await sql`
    SELECT name, email, mobile, accept, seats, ticket
    FROM rsvps
    ORDER BY accept DESC, updated_at DESC
  `
  const replies = rows.map((row) => ({
    name: String(row.name),
    email: String(row.email),
    mobile: String(row.mobile),
    accept: Boolean(row.accept),
    seats: Number(row.seats),
    ticket: String(row.ticket),
  }))
  const invites = await sql`
    SELECT i.code, i.label, i.seats, r.name AS reply_name, r.accept AS reply_accept, r.seats AS claimed
    FROM invites i
    LEFT JOIN rsvps r ON r.invite_id = i.id
    ORDER BY i.created_at DESC
  `
  const coming = replies.filter((row) => row.accept).length
  return {
    coming,
    declined: replies.length - coming,
    seats: replies.reduce((sum, row) => sum + (row.accept ? row.seats : 0), 0),
    replies,
    invites: invites.map((row) => ({
      code: String(row.code),
      label: String(row.label),
      seats: Number(row.seats),
      reply: row.reply_name == null ? null : {
        name: String(row.reply_name),
        accept: Boolean(row.reply_accept),
        seats: Number(row.claimed),
      },
    })),
  }
}

export async function handleDashboard(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' })
    const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>
    const allowed = gate(String(body.passphrase || ''))
    if (allowed === 'missing') return json(res, 500, { error: 'The dashboard is not ready yet.' })
    if (allowed === 'no') return json(res, 401, { error: 'That passphrase is not right.' })

    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString()) as unknown as Sql
    const action = String(body.action || '')

    if (action === 'create') {
      const label = String(body.label || '').trim()
      const seats = Math.round(Number(body.seats))
      if (!label || label.length > 80) return json(res, 400, { error: 'Add the household name.' })
      if (!Number.isInteger(seats) || seats < 1 || seats > 12) return json(res, 400, { error: 'Choose 1 to 12 seats.' })
      let saved = false
      for (let attempt = 0; attempt < 5 && !saved; attempt += 1) {
        try {
          await sql`INSERT INTO invites (code, label, seats) VALUES (${makeCode()}, ${label}, ${seats})`
          saved = true
        } catch (err) {
          if (!uniqueViolation(err)) throw err
        }
      }
      if (!saved) return json(res, 500, { error: 'Could not create that link. Try again.' })
    }

    if (action === 'remove') {
      const code = String(body.code || '').trim().toLowerCase()
      const removed = await sql`
        DELETE FROM invites i
        WHERE i.code = ${code}
          AND NOT EXISTS (SELECT 1 FROM rsvps r WHERE r.invite_id = i.id)
        RETURNING code
      `
      if (!removed[0]) return json(res, 400, { error: 'That link has a reply, so it stays.' })
    }

    json(res, 200, await board(sql))
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Dashboard failed')
    json(res, 500, { error: 'Could not open the dashboard. Try again.' })
  }
}

export default handleDashboard
