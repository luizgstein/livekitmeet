import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';

/* ---------- REST client ---------- */
const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

/* ---------- POST /api/create-room ---------- */
export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();

  const roomId = generateRoomId();               // ex.: abc‑defg‑hij
  await roomClient.createRoom({ name: roomId }); // cria a sala no LiveKit

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: hostIdentity },
  );
  at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });
  const hostToken = at.toJwt();                  // <- string JWT

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/$/, '');
  return NextResponse.json({
    roomId,
    hostToken,
    joinUrl: `${base}/r/${roomId}`,
  });
}
