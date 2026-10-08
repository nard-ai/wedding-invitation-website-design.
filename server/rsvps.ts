import { neon } from '@neondatabase/serverless'
import type { IncomingMessage, ServerResponse } from 'node:http'

function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

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

export async function handleRsvp(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await db()`
        SELECT name, message, updated_at
        FROM rsvps
        WHERE message <> ''
        ORDER BY updated_at DESC
      `
      json(res, 200, rows.map((row) => ({
        name: String(row.name),
        message: String(row.message),
        updatedAt: new Date(String(row.updated_at)).toISOString(),
      })))
      return
    }

    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed.' })
      return
    }

    const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const mobile = String(body.mobile || '').trim()
    const accept = body.accept
    const message = String(body.message ?? body.msg ?? '').trim()
    if (!name) return json(res, 400, { error: 'Add your full name.' })
    if (!/\S+@\S+\.\S+/.test(email)) return json(res, 400, { error: 'Add a valid email.' })
    if (mobile.replace(/\D/g, '').length < 10) return json(res, 400, { error: 'Add your mobile number.' })
    if (typeof accept !== 'boolean') return json(res, 400, { error: 'Tap the heart or the X to reply.' })
    const seats = accept ? Math.min(4, Math.max(1, Number(body.seats) || 1)) : 0

    const rows = await db()`
      INSERT INTO rsvps (name, email, mobile, accept, seats, message)
      VALUES (${name}, ${email}, ${mobile}, ${accept}, ${seats}, ${message})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        mobile = EXCLUDED.mobile,
        accept = EXCLUDED.accept,
        seats = EXCLUDED.seats,
        message = EXCLUDED.message,
        updated_at = now()
      RETURNING name, email, mobile, accept, seats, ticket, message
    `
    const row = rows[0]
    if (!row) return json(res, 500, { error: 'Could not save your reply. Try again.' })
    json(res, 200, {
      accept: Boolean(row.accept),
      name: String(row.name),
      email: String(row.email),
      mobile: String(row.mobile),
      seats: Number(row.seats),
      ticket: String(row.ticket),
      msg: String(row.message),
    })
  } catch {
    json(res, 500, { error: 'Could not save your reply. Try again.' })
  }
}
