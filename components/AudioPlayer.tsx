
import React, { useRef, useState, useEffect } from 'react';
import { AudioPlayerProps } from '../types';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  fileId,
  apiKey,
  trackTitle = "Unknown Track", 
  trackArtist = "Unknown Artist",
  onNextTrack,
  onPrevTrack
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for URL retry logic
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [activeSrc, setActiveSrc] = useState<string>('');

  // Define strategies for URL generation
  // We reconstruct this whenever fileId or apiKey changes
  const urlStrategies = React.useMemo(() => {
    const strategies = [];
    
    // Strategy 1: Google Drive API (Best if key works)
    if (apiKey && apiKey.length > 5) {
      strategies.push(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`);
    }
    
    // Strategy 2: Standard Drive Download (Often works for public files)
    strategies.push(`https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`);
    
    // Strategy 3: Docs export (Alternate domain sometimes bypasses blocks)
    strategies.push(`https://docs.google.com/uc?export=download&id=${fileId}&confirm=t`);

    return strategies;
  }, [fileId, apiKey]);

  // Reset when track changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setActiveSrc(urlStrategies[0]);
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    
    // Small timeout to allow render cycle to update audio src before playing
    const timer = setTimeout(() => {
      if (audioRef.current) {
        // Attempt autoplay
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(e => {
              console.log("Autoplay prevented or waiting for user interaction", e);
              setIsPlaying(false);
            });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [fileId, urlStrategies]);

  // Standard audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null); // Clear error if success
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNextTrack) {
        onNextTrack();
      }
    };
    
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleError = (e: Event) => {
        setIsLoading(false);
        const audioEl = e.target as HTMLAudioElement;
        console.warn(`Audio error on attempt ${currentUrlIndex + 1}:`, audioEl.error);
        
        // Retry logic
        if (currentUrlIndex < urlStrategies.length - 1) {
          console.log("Retrying with next strategy...");
          const nextIndex = currentUrlIndex + 1;
          setCurrentUrlIndex(nextIndex);
          setActiveSrc(urlStrategies[nextIndex]);
          setIsLoading(true);
          // Audio element will reload automatically when src changes
          // We'll try to resume playing in the useEffect dependent on activeSrc? 
          // Actually, simply changing state triggers re-render, src updates.
          // We need to trigger load() or play() after update, usually handled by auto-play logic or user.
          // Let's force play in a separate effect or just let user click if autoplay fails.
          // Ideally, we want seamless retry.
          setTimeout(() => {
              if (audioRef.current && isPlaying) {
                  audioRef.current.play().catch(() => setIsPlaying(false));
              }
          }, 500);
        } else {
          // All strategies failed
          let errorMessage = "No se pudo cargar el audio.";
          if (audioEl.error) {
             // Specific error mapping...
             if (audioEl.error.code === 4 || audioEl.error.code === 3) {
                 errorMessage = "Drive bloqueó la reproducción. Verifica que el archivo sea 'Público'.";
             }
          }
          setError(errorMessage);
          setIsPlaying(false);
        }
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [onNextTrack, currentUrlIndex, urlStrategies, isPlaying]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (error) {
      // If clicked while error, maybe retry from start?
      setCurrentUrlIndex(0);
      setActiveSrc(urlStrategies[0]);
      setError(null);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Play interaction failed:", e);
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Number.isFinite(time)) {
        audio.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setVolume(newVolume);
    audio.volume = newVolume;
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      audio.muted = false;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audio.muted = newMutedState;
  };

  const viewLink = `https://drive.google.com/file/d/${fileId}/view`;

  return (
    <div className="flex flex-col items-center w-full">
      <audio 
        ref={audioRef} 
        src={activeSrc} 
        preload="auto"
        {...({ referrerPolicy: "no-referrer" } as any)}
      />

      {/* Album Art Placeholder */}
      <div className="relative w-48 h-48 mb-8 group cursor-pointer" onClick={togglePlayPause}>
        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-xl opacity-60 transition-all duration-700 ${isPlaying ? 'scale-110 opacity-80 animate-pulse' : 'scale-90'}`}></div>
        <div className="relative w-full h-full bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
           <img 
             src={`https://picsum.photos/seed/${fileId}/400/400?grayscale`} 
             alt="Album Art" 
             className={`w-full h-full object-cover opacity-80 transition-transform duration-[20s] ease-linear ${isPlaying ? 'rotate-180 scale-110' : 'rotate-0'}`} 
           />
           {isLoading && !error && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
               <div className="flex flex-col items-center">
                 <Loader2 className="animate-spin text-white mb-2" size={32} />
                 {currentUrlIndex > 0 && (
                   <span className="text-xs text-white/70">Intentando método {currentUrlIndex + 1}...</span>
                 )}
               </div>
             </div>
           )}
           {error && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
               <AlertCircle className="text-red-500" size={32} />
             </div>
           )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{trackTitle}</h2>
        <p className="text-slate-400 text-sm font-medium">{trackArtist}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 w-full bg-red-950/40 border border-red-500/20 rounded-xl p-4 flex flex-col items-center gap-3 text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-red-200 text-sm font-medium leading-relaxed">
            {error}
          </p>
          <div className="flex gap-2">
             <button 
                onClick={() => {
                  setCurrentUrlIndex(0);
                  setActiveSrc(urlStrategies[0]);
                  setError(null);
                  setIsLoading(true);
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full transition-colors"
              >
                <RefreshCw size={12} /> Reintentar
              </button>
              <a 
                href={viewLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-white text-xs px-4 py-2 rounded-full transition-colors border border-red-500/30"
              >
                <ExternalLink size={12} />
                Abrir en Drive
              </a>
          </div>
        </div>
      )}

      {/* Progress */}
      <ProgressBar 
        current={currentTime} 
        duration={duration} 
        onSeek={handleSeek} 
      />

      {/* Controls */}
      <div className={error ? 'opacity-50 pointer-events-none' : ''}>
        <Controls 
          isPlaying={isPlaying} 
          onPlayPause={togglePlayPause} 
          onSkipBack={onPrevTrack || (() => {})}
          onSkipForward={onNextTrack || (() => {})}
        />
      </div>

      {/* Volume */}
      <VolumeControl 
        volume={volume} 
        muted={isMuted} 
        onToggleMute={toggleMute} 
        onVolumeChange={handleVolumeChange} 
      />
    </div>
  );
};
