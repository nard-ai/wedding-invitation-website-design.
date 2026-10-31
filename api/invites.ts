import type { IncomingMessage, ServerResponse } from 'node:http'

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function connectionString() {
  const raw = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '')
  const url = raw.replace(/([?&])channel_binding=[^&]*&?/g, '$1').replace(/[?&]$/, '')
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

export async function handleInvite(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' })
    const url = new URL(req.url || '/', 'http://localhost')
    const code = (url.searchParams.get('code') || '').trim().toLowerCase()
    if (!/^[a-z0-9]{8}$/.test(code)) return json(res, 404, { error: 'This invitation link is not valid.' })

    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString())
    const rows = await sql`SELECT label, seats FROM invites WHERE code = ${code}`
    const row = rows[0]
    if (!row) return json(res, 404, { error: 'This invitation link is not valid.' })
    json(res, 200, { label: String(row.label), seats: Number(row.seats) })
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Invite lookup failed')
    json(res, 500, { error: 'Could not open this invitation. Try again.' })
  }
}

export default handleInvite
