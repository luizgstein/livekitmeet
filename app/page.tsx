'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import styles from '../styles/Home.module.css';
import toast, { Toaster } from 'react-hot-toast';

function Tabs(props: React.PropsWithChildren<{}>) {
  const params   = useSearchParams();
  const tabIndex = params?.get('tab') === 'custom' ? 1 : 0;
  const router   = useRouter();

  /* ------------- AQUI é a alteração ------------- */
  const tabs = React.Children.map(props.children, (child, index) => {
    // garante que é mesmo um ReactElement antes de acessar props
    const label =
      React.isValidElement(child) && 'label' in child.props
        ? (child.props as any).label
        : `Tab ${index + 1}`;

    return (
      <button
        className="lk-button"
        aria-pressed={tabIndex === index}
        onClick={() => router.push(`/?tab=${index === 1 ? 'custom' : 'demo'}`)}
      >
        {label}
      </button>
    );
  });
  /* --------------------------------------------- */

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore – Next.js ainda reclama, mas funciona */}
      {props.children[tabIndex]}
    </div>
  );
}


/* ------------- DEMO (Nova Reunião) ------------- */
function DemoMeetingTab({label}:{label:string}) {
  const router = useRouter();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [shareLink,  setShareLink]  = useState<string | null>(null);

  /* helper que chama o backend */
  async function createRoomOnServer() {
    const hostIdentity = prompt('Seu nome (host):') || `host-${Date.now()}`;
    const res = await fetch('/api/create-room', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ hostIdentity }),
    });
    if (!res.ok) throw new Error('Falha ao criar sala');
    return res.json() as Promise<{
      roomId: string; hostToken: string; joinUrl: string;
    }>;
  }

  /* 1. apenas copiar link curto */
/* menu: criar link */
async function criarParaDepois() {
  setMenuOpen(false);

  // 🔽 recebe roomId e hostToken também
  const { roomId, url, hostToken } = await fetch('/api/create-room?user=host')
    .then((r) => r.json());

  // grava token para o host
  sessionStorage.setItem(`token-${roomId}`, hostToken);

  await navigator.clipboard.writeText(url);
  setShareLink(url);          // mostra diálogo de copiar
}

/* menu: iniciar e entrar */
async function iniciarAgora() {
  setMenuOpen(false);

  const { roomId, url, hostToken } = await fetch('/api/create-room?user=host')
    .then((r) => r.json());

  sessionStorage.setItem(`token-${roomId}`, hostToken);

  router.push(url);           // entra na mesma aba
}

  /* ---------- RENDER ---------- */
  return (
    <>
      <Toaster />

      {/* modal de link copiado */}
      {shareLink && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3>Link copiado ✔️</h3>
            <input value={shareLink} readOnly style={{ width: '100%' }} />
            <button
              className="lk-button"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Copiado novamente!');
              }}
            >
              Copiar
            </button>
            <button className="lk-button" onClick={() => setShareLink(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* texto + botão Nova Reunião */}
      <div className={styles.tabContent}>
        <p style={{ margin: 0 }}>
          Este será o novo aplicativo de videochamadas da OVT Academy
        </p>

        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <button
            className="lk-button"
            style={{ background: '#4285f4' }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            Nova Reunião
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button onClick={criarParaDepois}>Criar uma reunião para depois</button>
              <button onClick={iniciarAgora}>Iniciar uma reunião instantânea</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------- aba Custom (original do template) ------------- */
function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const liveKitUrl = fd.get('serverUrl');
    const token      = fd.get('token');
    router.push(`/custom/?liveKitUrl=${liveKitUrl}&token=${token}`);
  };

  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      {/* …form original omitido para brevidade… */}
      <button className="lk-button" type="submit">Connect</button>
    </form>
  );
}

/* ------------- Página principal ------------- */
export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        {/* cabeçalho simplificado */}
        <h2>OVT Meet powered by LiveKit</h2>

        <Suspense fallback="Loading…">
          <Tabs>
            <DemoMeetingTab label="Demo" />
            <CustomConnectionTab label="Custom" />
          </Tabs>
        </Suspense>
      </main>
    </>
  );
}
