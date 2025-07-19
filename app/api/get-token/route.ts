import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

/* …imports… */
export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json();

  /* 1 h = 3600 s  (precisa ser number) */
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity, ttl: 60 * 60 },
  );

  at.addGrant({
    roomJoin: true,
    room: roomId,
    ...(role === 'host' ? { roomAdmin: true } : {}),
  });

  return NextResponse.json({ token: at.toJwt() });
}