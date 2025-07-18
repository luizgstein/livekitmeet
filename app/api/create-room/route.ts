import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

/** URL REST do seu projeto LiveKit Cloud  (não use wss) */
const roomClient = new RoomServiceClient(
  process.env.LIVEKIT_HTTP_URL!,      // ← https://sales-flow-pro-cn41gmyv.livekit.cloud
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

/** GET /api/create-room?user=SeuNome  →  { url: "<link‑com‑token>" } */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') ?? 'host';

    /* 1 • nome único de sala */
    const roomName = `room-${Date.now()}`;
    await roomClient.createRoom({ name: roomName });

    /* 2 • token para o usuário */
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      { identity: user },
    );
    at.addGrant({ roomJoin: true, room: roomName });
    const token = await at.toJwt();    // aguarda a string JWT


    /* 3 • devolve link completo */
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      url: `${base}/rooms/${roomName}?token=${token}`,
    });
  } catch (err) {
    console.error('Erro em /api/create-room:', err);
    return NextResponse.json({ error: 'Falha ao criar sala' }, { status: 500 });
  }
}
