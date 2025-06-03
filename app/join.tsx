import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  useMediaDevices,
  VideoRenderer,
  createLocalVideoTrack,
  LocalVideoTrack,
} from 'livekit-client';

export default function Join() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('reuniao123');
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const router = useRouter();

  // Lista dispositivos de vídeo
  const mediaDevices = useMediaDevices();

  useEffect(() => {
    if (mediaDevices && mediaDevices.videoInput.length > 0) {
      setDevices(mediaDevices.videoInput);
      setSelectedDeviceId(mediaDevices.videoInput[0].deviceId);
    }
  }, [mediaDevices]);

  // Inicia a câmera
  useEffect(() => {
    const startCamera = async () => {
      if (selectedDeviceId) {
        const track = await createLocalVideoTrack({
          deviceId: { exact: selectedDeviceId },
        });
        setVideoTrack(track);
      }
    };

    startCamera();

    return () => {
      videoTrack?.stop();
    };
  }, [selectedDeviceId]);

  const handleJoin = async () => {
    const res = await fetch('https://eoakvw76g3reezh.m.pipedream.net/', {
      method: 'POST',
      body: JSON.stringify({ name, room }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (data?.url) {
      router.push(data.url);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: 32, alignItems: 'center' }}>
      <h2>Entrar na reunião</h2>

      <div style={{ width: 320, height: 240, marginBottom: 16, backgroundColor: '#000' }}>
        {videoTrack && <VideoRenderer track={videoTrack} />}
      </div>

      <select
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 8, padding: 8, width: 200 }}
      />
      <input
        type="text"
        placeholder="Nome da sala"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: 200 }}
      />

      <button onClick={handleJoin} style={{ padding: '10px 20px' }}>
        Participar da reunião
      </button>
    </div>
  );
}
