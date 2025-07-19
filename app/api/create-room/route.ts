import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';


/* ①  cliente HTTP da LiveKit (para criar a sala, se quiser criar antes) */
const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,     // ex.: https://sales-flow-pro-cn41gmyv.livekit.cloud
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();          // e‑mail ou nome do host
  const roomId = generateRoomId();                    // ex.: 1dmk‑5aaz

  /* ②  (opcional) cria a sala antecipadamente */
  await roomClient.createRoom({ name: roomId });

  /* ③  gera o token do HOST */
  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: hostIdentity,
    ttl: 60 * 60,   // 1 hora em segundos  ← **number**, não string
  });
  at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });

  const hostToken = at.toJwt();                       // ← string JWT

  /* ④  devolve dados para o frontend */
  return NextResponse.json({
    roomId,
    hostToken,
    joinUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/r/${roomId}`,
  });
}
