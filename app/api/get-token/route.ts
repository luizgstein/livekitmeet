import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json(); // role: 'host' | 'guest'
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity },
  );

  if (role === 'host') {
    at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });
  } else {
    at.addGrant({ roomJoin: false, room: roomId });      // aguardará aprovação
  }

  return NextResponse.json({ token: at.toJwt() });
}
