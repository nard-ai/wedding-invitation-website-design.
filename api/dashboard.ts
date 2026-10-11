import { timingSafeEqual } from 'node:crypto'
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

export async function handleDashboard(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' })
    const body = JSON.parse((await readBody(req)) || '{}') as { passphrase?: unknown }
    const allowed = gate(String(body.passphrase || ''))
    if (allowed === 'missing') return json(res, 500, { error: 'The dashboard is not ready yet.' })
    if (allowed === 'no') return json(res, 401, { error: 'That passphrase is not right.' })

    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString())
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
    const coming = replies.filter((row) => row.accept).length
    json(res, 200, {
      coming,
      declined: replies.length - coming,
      seats: replies.reduce((sum, row) => sum + (row.accept ? row.seats : 0), 0),
      replies,
    })
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Dashboard failed')
    json(res, 500, { error: 'Could not open the dashboard. Try again.' })
  }
}

export default handleDashboard
