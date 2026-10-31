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

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>

async function saveInvited(sql: Sql, input: { name: string; email: string; mobile: string; accept: boolean; seats: number; message: string; inviteId: string }) {
  const existing = await sql`
    SELECT id, email, invite_id::text AS invite_id
    FROM rsvps
    WHERE invite_id = ${input.inviteId}::uuid OR email = ${input.email}
  `
  const owned = existing.find((row) => String(row.invite_id || '') === input.inviteId)
  const emailRow = existing.find((row) => String(row.email) === input.email)
  if (emailRow && (!owned || String(emailRow.id) !== String(owned.id))) return null
  const target = owned || emailRow
  if (target) {
    return sql`
      UPDATE rsvps SET
        name = ${input.name},
        email = ${input.email},
        mobile = ${input.mobile},
        accept = ${input.accept},
        seats = ${input.seats},
        message = ${input.message},
        invite_id = ${input.inviteId}::uuid,
        updated_at = now()
      WHERE id = ${String(target.id)}::uuid
      RETURNING name, email, mobile, accept, seats, ticket, message
    `
  }
  return sql`
    INSERT INTO rsvps (name, email, mobile, accept, seats, message, invite_id)
    VALUES (${input.name}, ${input.email}, ${input.mobile}, ${input.accept}, ${input.seats}, ${input.message}, ${input.inviteId}::uuid)
    RETURNING name, email, mobile, accept, seats, ticket, message
  `
}

function connectionString() {
  const raw = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '')
  const url = raw.replace(/([?&])channel_binding=[^&]*&?/g, '$1').replace(/[?&]$/, '')
  if (!url) throw new Error('DATABASE_URL is not set')
  return url
}

export async function handleRsvp(req: IncomingMessage, res: ServerResponse) {
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(connectionString())

    if (req.method === 'GET') {
      const rows = await sql`
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
    const code = String(body.invite || '').trim().toLowerCase()
    let cap = 4
    let inviteId: string | null = null
    if (code) {
      if (!/^[a-z0-9]{8}$/.test(code)) return json(res, 404, { error: 'This invitation link is not valid.' })
      const found = await sql`SELECT id, seats FROM invites WHERE code = ${code}`
      const invite = found[0]
      if (!invite) return json(res, 404, { error: 'This invitation link is not valid.' })
      inviteId = String(invite.id)
      cap = Number(invite.seats)
    } else {
      const linked = await sql`
        SELECT i.seats
        FROM rsvps r
        JOIN invites i ON i.id = r.invite_id
        WHERE r.email = ${email}
      `
      if (linked[0]) cap = Number(linked[0].seats)
    }
    const seats = accept ? Math.min(cap, Math.max(1, Number(body.seats) || 1)) : 0

    const rows = inviteId
      ? await saveInvited(sql as unknown as Sql, { name, email, mobile, accept, seats, message, inviteId })
      : await sql`
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
    if (rows === null) return json(res, 409, { error: 'This email already replied on another invitation.' })
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
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'RSVP failed')
    json(res, 500, { error: 'Could not save your reply. Try again.' })
  }
}

export default handleRsvp
