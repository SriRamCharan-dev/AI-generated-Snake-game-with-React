import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Nights",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/neon1/200/200?blur=2"
  },
  {
    id: 2,
    title: "Cyber City",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/neon2/200/200?blur=2"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/neon3/200/200?blur=2"
  }
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Force reload when track changes
    audio.load();

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore AbortError (interrupted by pause/load) and NotSupportedError (no supported source)
          if (error.name !== 'AbortError' && error.name !== 'NotSupportedError') {
            console.error("Audio play failed:", error.message || error);
            setIsPlaying(false);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioError = () => {
    console.error("Audio failed to load:", currentTrack.url);
    setIsPlaying(false);
  };

  return (
    <div className="bg-black border border-magenta/50 p-6 shadow-[0_0_30px_rgba(255,0,255,0.1)] flex flex-col w-full max-w-sm mx-auto relative overflow-hidden">
      {/* CRT Lines for player */}
      <div className="absolute inset-0 pointer-events-none crt-lines opacity-10" />
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onError={handleAudioError}
      />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-none overflow-hidden border border-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] shrink-0">
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-magenta font-display font-black text-lg truncate tracking-widest uppercase">{currentTrack.title}</h3>
          <p className="text-cyan font-pixel text-[8px] truncate uppercase tracking-tighter mt-1">SOURCE: {currentTrack.artist}</p>
        </div>
      </div>

      <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-900 rounded-none appearance-none cursor-pointer accent-magenta"
          />
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-cyan/60 hover:text-cyan transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev}
            className="text-cyan hover:text-magenta transition-colors drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
          >
            <SkipBack size={24} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center bg-magenta text-black rounded-none shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:bg-white transition-all"
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
          <button 
            onClick={handleNext}
            className="text-cyan hover:text-magenta transition-colors drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
          >
            <SkipForward size={24} />
          </button>
        </div>
        
        <div className="w-5"></div> {/* Spacer for balance */}
      </div>
    </div>
  );
}
