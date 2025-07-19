import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  // corpo da request
  const { roomId, identity, role } = await req.json();

  // 1) cria o AccessToken (apiKey, apiSecret, opções)
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,      // string
    process.env.LIVEKIT_API_SECRET!,   // string
    {
      identity,                        // ← usa a variável 'identity' recebida
      ttl: 60 * 60,                    // 1 h (exemplo)
    },
  );

  // 2) permissões de acordo com a role
  at.addGrant({
    roomJoin : true,
    room     : roomId,
    canPublish: role === 'host',       // host pode publicar, guest não
    roomAdmin: role === 'host',
  });

  // 3) gera token JWT
  const token = at.toJwt();            // agora é string

  return NextResponse.json({ token });
}
