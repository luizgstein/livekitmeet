'use client';

import { useParams } from 'next/navigation';
import { Room } from 'livekit-client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    async function connect() {
      /* ─── 1 ▸ pega token salvo (host) ou cria (guest) ─── */
      let token: string | null = sessionStorage.getItem(`token-${roomId}`);

      if (!token) {
        const identity = prompt('Seu nome:') || `guest-${Math.random()}`;
        const res = await fetch('/api/get-token', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ roomId, identity, role: 'guest' }),
        });
        token = (await res.json()).token;
      }
      if (!token) throw new Error('Não foi possível obter o token JWT');

      /* ─── 2 ▸ conecta ao LiveKit ─── */
      const room = new Room();
      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

      /* ─── 3 ▸ listener de sala de espera ─── */
      (room.on as any)('participantWaiting', (p: any) => {
  setWaiting(true);
  toast((t) => (
    <span>
      {p.identity} quer entrar&nbsp;
      <button
        onClick={() => {
          /* cast aqui ↓ para acessar o método “oculto” */
          (room as any).updateParticipant(p.sid, {
            permissions: { roomJoin: true },
          });
          toast.dismiss(t.id);
        }}
      >
        Admitir
      </button>
    </span>
  ));
});

    }

    connect();
  }, [roomId]);

  return (
    <>
      <Toaster />
      {waiting && (
        <div style={{ background: '#ffc', padding: 8, marginBottom: 8 }}>
          Há pessoas na sala de espera…
        </div>
      )}
      {/* Aqui você pode renderizar <VideoConference /> ou sua UI personalizada */}
    </>
  );
}
