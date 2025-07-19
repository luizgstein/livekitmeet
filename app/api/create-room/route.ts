import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';

const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();

  const roomId = generateRoomId();          // ex: 1dmk‑5aaz
  await roomClient.createRoom({ name: roomId });

  /** 🔑  ESTA linha TEM de chamar `.toJwt()` – retorna string  */
  // 1) cria o token
const at = new AccessToken(
  process.env.LIVEKIT_API_KEY!,          // apiKey   (string)
  process.env.LIVEKIT_API_SECRET!,       // apiSecret(string)
  { identity: hostIdentity },            // opções
);

// 2) adiciona as permissões
at.addGrant({
  roomJoin : true,
  roomAdmin: true,
  room     : roomId,
});

// 3) gera a string JWT
const hostToken = at.toJwt();            // ← agora é string


  return NextResponse.json({
    roomId,
    hostToken,                               // string
    joinUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/r/${roomId}`,
  });
}
