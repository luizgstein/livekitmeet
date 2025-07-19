import { NextRequest, NextResponse } from 'next/server';
import { AccessToken }              from 'livekit-server-sdk';
import { RoomServiceClient }        from 'livekit-server-sdk';
import { generateRoomId }           from '@/lib/client-utils';

const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json();            // ex.: email

  const roomId = generateRoomId();                      // 8‑car ou 4‑4 formato
  await roomClient.createRoom({ name: roomId });

  // ▶️  NOVA forma de criar o token  (apenas um parâmetro – objeto)
const at = new AccessToken(
  process.env.LIVEKIT_API_KEY!,      // 1º parâmetro  ← string
  process.env.LIVEKIT_API_SECRET!,   // 2º parâmetro  ← string
  {
    identity: hostIdentity,          // 3º parâmetro  ← objeto de opções
    ttl: 60 * 60,                    // (ex.) 1 hora
  },
);

at.addGrant({
  roomJoin : true,
  roomAdmin: true,
  room     : roomId,
});

const hostToken = at.toJwt();        // ← agora sim: string JWT gigante

  return NextResponse.json({
    roomId,
    hostToken,
    joinUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/r/${roomId}`,
  });
}
