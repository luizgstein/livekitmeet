import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

/* …imports… */

export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json();

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity, ttl: 60 * 60 }, // 1 h opc.
  );

  at.addGrant({
    roomJoin: true,
    room    : roomId,
    ...(role === 'host' ? { roomAdmin: true } : {}),
  });

  const token = at.toJwt();

  return NextResponse.json({ token });
}
