import {
  Download,
  FastForward,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioExtensionFor, formatTime, useAudioStore } from '../lib/audioStore';

function PlayerButton({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-blue-50/80 transition hover:border-amber/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export default function BottomPlayer() {
  const {
    creations,
    currentCreation,
    currentSource,
    currentTime,
    playerLength,
    volume,
    muted,
    isPlaying,
    togglePlay,
    previous,
    next,
    rewind,
    fastForward,
    seekTo,
    setVolume,
    setMuted,
  } = useAudioStore();

  const disabled = !currentCreation || !currentSource;
  const trackLength = playerLength || currentCreation?.lengthSeconds || 0;
  const progressMax = Math.max(trackLength, currentTime, 1);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[rgba(7,18,34,0.92)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1440px] gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(380px,1.3fr)_minmax(180px,auto)] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white shadow-[0_0_34px_rgba(56,189,248,0.22)]">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">
              {currentCreation?.title || 'Create a track to start listening'}
            </div>
            <div className="truncate text-xs font-semibold text-blue-50/60">
              {currentCreation ? `${currentCreation.style} - ${currentCreation.kind}` : `${creations.length} tracks in library`}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-center gap-2">
            <PlayerButton label="Previous track" disabled={creations.length < 2} onClick={previous}>
              <SkipBack size={17} />
            </PlayerButton>
            <PlayerButton label="Rewind 10 seconds" disabled={disabled} onClick={rewind}>
              <Rewind size={17} />
            </PlayerButton>
            <button
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={disabled}
              onClick={togglePlay}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-[#08101b] transition hover:bg-amber disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
            </button>
            <PlayerButton label="Fast forward 10 seconds" disabled={disabled} onClick={fastForward}>
              <FastForward size={17} />
            </PlayerButton>
            <PlayerButton label="Next track" disabled={creations.length < 2} onClick={next}>
              <SkipForward size={17} />
            </PlayerButton>
          </div>

          <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-2">
            <span className="text-right text-xs font-bold tabular-nums text-blue-50/60">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={progressMax}
              step="0.01"
              disabled={disabled}
              value={Math.min(currentTime, progressMax)}
              onChange={(event) => seekTo(event.target.value)}
              className="h-1 w-full accent-sky disabled:opacity-30"
              aria-label="Seek"
            />
            <span className="text-xs font-bold tabular-nums text-blue-50/60">{formatTime(trackLength)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-blue-50/80 transition hover:border-amber/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={disabled}
            onClick={() => setMuted(!muted)}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(event.target.value)}
            className="hidden w-24 accent-sky sm:block"
            aria-label="Volume"
          />
          <a
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-black transition ${
              currentSource
                ? 'bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white hover:brightness-105'
                : 'pointer-events-none bg-white/5 text-blue-50/25'
            }`}
            href={currentSource || undefined}
            download={`soundly-${currentCreation?.kind || 'track'}-${currentCreation?.id || 'track'}.${audioExtensionFor(currentCreation)}`}
          >
            <Download size={15} />
            Save
          </a>
        </div>
      </div>
    </div>
  );
}
