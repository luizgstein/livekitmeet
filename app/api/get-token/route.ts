import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json();

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
  );
  at.identity = identity;
  at.addGrant({ roomJoin: true, room: roomId, canPublish: role === 'host' });

  /* string JWT */
  return NextResponse.json({ token: at.toJwt() });
}
