import React, { useRef, useState, useEffect } from 'react';
import { AudioPlayerProps } from '../types';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  trackTitle = "Unknown Track", 
  trackArtist = "Unknown Artist",
  onNextTrack,
  onPrevTrack
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset and autoplay when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);
    setIsPlaying(true); // Try to autoplay when track changes
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        // Auto-play might be blocked by browser
        console.log("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    }

  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
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
        console.warn("Audio error occurred:", audioEl.error);
        
        let errorMessage = "No se pudo cargar el audio.";
        if (audioEl.error) {
          switch (audioEl.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "La reproducción fue interrumpida.";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Error de red al intentar conectar con Drive.";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "El navegador no pudo decodificar el archivo de audio.";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Drive bloqueó la reproducción (Error 403/404).";
              break;
            default:
              errorMessage = "Error desconocido.";
          }
        }
        setError(errorMessage);
        setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    if (audio.readyState >= 1) {
        setAudioData();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [src, onNextTrack]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (error) return;

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

  const handleNext = () => {
    if (onNextTrack) onNextTrack();
  };

  const handlePrev = () => {
    if (onPrevTrack) onPrevTrack();
  };

  // Helper to generate the view link from the download link or API link
  let viewLink = src;
  if (src.includes('uc?export=download')) {
     viewLink = src
      .replace('uc?export=download&id=', 'file/d/')
      .replace('&confirm=t', '/view');
  } else if (src.includes('googleapis.com')) {
     // Try to extract ID from API URL roughly
     const idMatch = src.match(/files\/([^?]+)/);
     if (idMatch && idMatch[1]) {
       viewLink = `https://drive.google.com/file/d/${idMatch[1]}/view`;
     }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <audio 
        ref={audioRef} 
        src={src} 
        preload="auto"
        {...({ referrerPolicy: "no-referrer" } as any)}
      />

      {/* Album Art Placeholder with Visualizer Effect */}
      <div className="relative w-48 h-48 mb-8 group cursor-pointer" onClick={togglePlayPause}>
        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-xl opacity-60 transition-all duration-700 ${isPlaying ? 'scale-110 opacity-80 animate-pulse' : 'scale-90'}`}></div>
        <div className="relative w-full h-full bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
           <img 
             src="https://picsum.photos/400/400?grayscale" 
             alt="Album Art" 
             className={`w-full h-full object-cover opacity-80 transition-transform duration-[20s] ease-linear ${isPlaying ? 'rotate-180 scale-110' : 'rotate-0'}`} 
           />
           {isLoading && !error && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
               <Loader2 className="animate-spin text-white" size={32} />
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
          onSkipBack={handlePrev}
          onSkipForward={handleNext}
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