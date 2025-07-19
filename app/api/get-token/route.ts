import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json();

  const at = new AccessToken(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);
at.identity = identity;                    // identidade vinda do POST
at.addGrant({
  roomJoin: true,
  room    : roomId,
  // se a role for "host", você pode liberar publicação
  canPublish: role === 'host',
});

const token = at.toJwt();                 // << agora é string
return NextResponse.json({ token });
}
