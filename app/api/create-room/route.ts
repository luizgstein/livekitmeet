import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';

/* ─── cliente para o LiveKit Cloud ─── */
const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,   // ex.: https://xyz.livekit.cloud
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

/* ─── função que cria sala + token de host ─── */
async function createRoom(hostIdentity = 'host') {
  const roomId = generateRoomId();          // p.ex.: 9abc‑defg
  await roomClient.createRoom({ name: roomId });

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: hostIdentity },
  );
  at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });
  const hostToken = at.toJwt();

  return NextResponse.json({
    roomId,
    hostToken,
    joinUrl:
      `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || ''}/r/${roomId}`,
  });
}

/* ─── POST (já existia) ─── */
export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();
  return createRoom(hostIdentity);
}

/* ─── GET (novo) ───  /api/create-room?user=host */
export async function GET(req: NextRequest) {
  const hostIdentity = req.nextUrl.searchParams.get('user') ?? 'host';
  return createRoom(hostIdentity);
}
