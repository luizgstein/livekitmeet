import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  const { roomId, identity, role } = await req.json();

  // 1) monta o token
const at = new AccessToken(
  process.env.LIVEKIT_API_KEY!,        // apiKey
  process.env.LIVEKIT_API_SECRET!,     // apiSecret
  { identity, ttl: 60 * 60 },          // (ex.) 1 h
);

// 2) adiciona as permissões do convidado
at.addGrant({
  roomJoin : true,
  room     : roomId,
  // se quiser que o guest possa publicar vídeo/áudio acrescente:
  // canPublish: true,
});

// 3) gera a string JWT
const token = at.toJwt();              // ← agora é string

return NextResponse.json({ token });
}
