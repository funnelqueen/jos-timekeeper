export default async function handler(req: any, res: any) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.status(200).json({ ok: true, ip, now: new Date().toISOString() })
}

