import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { moodPresets, moodProfileFor, stylePresets, styleProfileFor } from './audioProfiles';

export const generationKinds = [
  {
    id: 'song',
    label: 'Song',
    description: 'Full arrangement with vocal-ready structure.',
  },
  {
    id: 'instrumental',
    label: 'Instrumental',
    description: 'No lead vocal, built for beds, beats, and scoring.',
  },
  {
    id: 'remix',
    label: 'Remix',
    description: 'A new version with stronger movement and fresh energy.',
  },
];

export { moodPresets, stylePresets };

export const defaultSettings = {
  kind: 'song',
  prompt: 'A blue-lit late night pop song with warm synth chords, clean drums, emotional hook, polished radio mix',
  style: 'Pop',
  mood: 'Warm',
  duration: 20,
  energy: 6,
  sourceCreationId: null,
};

const AudioStoreContext = createContext(null);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDuration(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function audioSourceFor(item) {
  const result = item?.result || item?.creation?.result;
  if (!result) return '';
  if (result.audioUrl) return result.audioUrl;
  if (result.audioBase64) return `data:${result.mimeType || 'audio/wav'};base64,${result.audioBase64}`;
  return '';
}

export function audioExtensionFor(item) {
  const mimeType = item?.result?.mimeType || '';
  if (mimeType.includes('flac')) return 'flac';
  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  return 'wav';
}

function normalizeSettings(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    kind: generationKinds.some((kind) => kind.id === settings.kind) ? settings.kind : defaultSettings.kind,
    prompt: String(settings.prompt || defaultSettings.prompt),
    style: styleProfileFor(settings.style || defaultSettings.style).name,
    mood: moodProfileFor(settings.mood || defaultSettings.mood).name,
    duration: Number(settings.duration || defaultSettings.duration),
    energy: Number(settings.energy ?? defaultSettings.energy),
    sourceCreationId: settings.sourceCreationId || null,
  };
}

export function AudioStoreProvider({ children }) {
  const audioRef = useRef(null);
  const playAfterSourceChangeRef = useRef(false);
  const [creations, setCreations] = useState([]);
  const [audioStatus, setAudioStatus] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [generationError, setGenerationError] = useState('');

  const currentCreation = useMemo(
    () => creations.find((creation) => creation.id === currentId) || creations[0] || null,
    [creations, currentId],
  );
  const currentSource = audioSourceFor(currentCreation);

  const refreshLibrary = useCallback(async () => {
    const response = await fetch('/api/creations');
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Could not load library');
    setCreations(payload.creations || []);
    return payload.creations || [];
  }, []);

  const refreshStatus = useCallback(async () => {
    const response = await fetch('/api/audio/status');
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Could not load audio status');
    setAudioStatus(payload);
    return payload;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [statusPayload, libraryPayload] = await Promise.all([
          fetch('/api/audio/status').then((response) => response.json()),
          fetch('/api/creations').then((response) => response.json()),
        ]);
        if (cancelled) return;
        setAudioStatus(statusPayload.ok ? statusPayload : { ready: false });
        setCreations(libraryPayload.ok ? libraryPayload.creations || [] : []);
      } catch {
        if (!cancelled) setAudioStatus({ ready: false });
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => setCurrentTime(audio.currentTime || 0);
    const syncDuration = () => setPlayerDuration(Number.isFinite(audio.duration) ? audio.duration : currentCreation?.duration || 0);
    const markPlaying = () => setIsPlaying(true);
    const markPaused = () => setIsPlaying(false);
    const playNext = () => {
      setIsPlaying(false);
      if (creations.length > 1) {
        playAfterSourceChangeRef.current = true;
        setCurrentId((previousId) => {
          const currentIndex = Math.max(0, creations.findIndex((creation) => creation.id === previousId));
          return creations[(currentIndex + 1) % creations.length]?.id || previousId;
        });
      }
    };

    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('loadedmetadata', syncDuration);
    audio.addEventListener('durationchange', syncDuration);
    audio.addEventListener('play', markPlaying);
    audio.addEventListener('pause', markPaused);
    audio.addEventListener('ended', playNext);

    return () => {
      audio.removeEventListener('timeupdate', syncTime);
      audio.removeEventListener('loadedmetadata', syncDuration);
      audio.removeEventListener('durationchange', syncDuration);
      audio.removeEventListener('play', markPlaying);
      audio.removeEventListener('pause', markPaused);
      audio.removeEventListener('ended', playNext);
    };
  }, [creations, currentCreation?.duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setCurrentTime(0);
    setPlayerDuration(currentCreation?.duration || 0);
    if (!currentSource) {
      setIsPlaying(false);
      return;
    }
    if (playAfterSourceChangeRef.current) {
      playAfterSourceChangeRef.current = false;
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentSource, currentCreation?.duration]);

  const playCreation = useCallback((id) => {
    if (!id) return;
    playAfterSourceChangeRef.current = true;
    setCurrentId(id);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSource) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentSource]);

  const moveBy = useCallback((offset) => {
    const audio = audioRef.current;
    if (!audio || !currentSource) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + offset), audio.duration || playerDuration || 0);
    setCurrentTime(audio.currentTime);
  }, [currentSource, playerDuration]);

  const seekTo = useCallback((value) => {
    const audio = audioRef.current;
    if (!audio || !currentSource) return;
    audio.currentTime = Math.min(Math.max(0, Number(value)), audio.duration || playerDuration || 0);
    setCurrentTime(audio.currentTime);
  }, [currentSource, playerDuration]);

  const setVolume = useCallback((value) => {
    const nextVolume = Math.min(Math.max(Number(value), 0), 1);
    setVolumeState(nextVolume);
    setMuted(nextVolume === 0);
  }, []);

  const selectRelative = useCallback((direction) => {
    if (!creations.length) return;
    playAfterSourceChangeRef.current = isPlaying;
    setCurrentId((previousId) => {
      const currentIndex = Math.max(0, creations.findIndex((creation) => creation.id === previousId));
      const nextIndex = (currentIndex + direction + creations.length) % creations.length;
      return creations[nextIndex]?.id || previousId;
    });
  }, [creations, isPlaying]);

  const generate = useCallback(async (settingsInput) => {
    const settings = normalizeSettings(settingsInput);
    setGenerationError('');
    setActiveJob({
      id: 'pending',
      status: 'queued',
      settings,
      createdAt: new Date().toISOString(),
    });

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Generation failed');

      let currentJob = payload.job;
      setActiveJob(currentJob);
      while (['queued', 'running'].includes(currentJob.status)) {
        await delay(1200);
        const jobResponse = await fetch(`/api/audio/generate/${currentJob.id}`);
        const jobPayload = await jobResponse.json();
        if (!jobResponse.ok || !jobPayload.ok) throw new Error(jobPayload.error || 'Could not fetch generation job');
        currentJob = jobPayload.job;
        setActiveJob(currentJob);
      }

      if (currentJob.status === 'failed') throw new Error(currentJob.error || 'Generation failed');

      const updatedCreations = await refreshLibrary();
      const created = currentJob.creation || updatedCreations.find((creation) => creation.id === currentJob.id) || null;
      if (created) {
        setCurrentId(created.id);
      }
      return currentJob;
    } catch (error) {
      setGenerationError(error.message);
      throw error;
    } finally {
      setActiveJob((job) => (job?.status === 'completed' ? job : null));
    }
  }, [refreshLibrary]);

  const deleteCreation = useCallback(async (id) => {
    const response = await fetch(`/api/creations/${id}`, { method: 'DELETE' });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Could not delete creation');
    setCreations(payload.creations || []);
    setCurrentId((previousId) => (previousId === id ? payload.creations?.[0]?.id || null : previousId));
  }, []);

  const value = useMemo(() => ({
    audioRef,
    creations,
    audioStatus,
    currentCreation,
    currentSource,
    currentTime,
    playerDuration,
    volume,
    muted,
    isPlaying,
    activeJob,
    generationError,
    refreshLibrary,
    refreshStatus,
    generate,
    deleteCreation,
    playCreation,
    togglePlay,
    previous: () => selectRelative(-1),
    next: () => selectRelative(1),
    rewind: () => moveBy(-10),
    fastForward: () => moveBy(10),
    seekTo,
    setVolume,
    setMuted,
    setCurrentId,
  }), [
    activeJob,
    audioStatus,
    creations,
    currentCreation,
    currentSource,
    currentTime,
    deleteCreation,
    generate,
    generationError,
    isPlaying,
    moveBy,
    muted,
    playCreation,
    playerDuration,
    refreshLibrary,
    refreshStatus,
    seekTo,
    selectRelative,
    setVolume,
    togglePlay,
    volume,
  ]);

  return (
    <AudioStoreContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" src={currentSource || undefined} />
    </AudioStoreContext.Provider>
  );
}

export function useAudioStore() {
  const context = useContext(AudioStoreContext);
  if (!context) throw new Error('useAudioStore must be used inside AudioStoreProvider');
  return context;
}
