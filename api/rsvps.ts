import { handleRsvp } from '../server/rsvps'

export default function handler(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) {
  return handleRsvp(req, res)
}
