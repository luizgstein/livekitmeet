import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';

const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();   // nome ou e‑mail do host

  /* ---------- cria a sala ---------- */
  const roomId = generateRoomId();             // ex.: eqvh-qen1
  await roomClient.createRoom({ name: roomId });

  /* ---------- monta o token do host ---------- */
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
  );
  at.identity = hostIdentity;                  // quem é o host
  at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });

  const hostToken = at.toJwt();                // << string JWT

  /* ---------- monta o link ---------- */
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/$/, '');
  const joinUrl = `${base}/r/${roomId}`;

  return NextResponse.json({ roomId, hostToken, joinUrl });
}
