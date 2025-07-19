import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { generateRoomId } from '@/lib/client-utils';

const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: NextRequest) {
  const { hostIdentity } = await req.json(); // ex.: email

  const roomId = generateRoomId();           // abc-defg-hij
  await roomClient.createRoom({ name: roomId });

  // 1 • cria o token
const at = new AccessToken(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
  { identity: hostIdentity },
);

// 2 • adiciona as permissões
at.addGrant({ roomJoin: true, roomAdmin: true, room: roomId });

// 3 • gera a string JWT
const hostToken = at.toJwt();

  return NextResponse.json({
    roomId,
    hostToken,
    joinUrl: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/r/${roomId}`,
  });
}
