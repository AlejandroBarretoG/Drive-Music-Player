import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { ControlsProps } from '../types';

export const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  onPlayPause, 
  onSkipBack, 
  onSkipForward 
}) => {
  return (
    <div className="flex items-center justify-center gap-8 mb-6">
      <button 
        onClick={onSkipBack}
        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        aria-label="Anterior canción"
      >
        <SkipBack size={28} />
      </button>

      <button
        onClick={onPlayPause}
        className="bg-white text-slate-900 rounded-full p-4 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20"
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying ? (
          <Pause size={32} fill="currentColor" />
        ) : (
          <Play size={32} fill="currentColor" className="ml-1" />
        )}
      </button>

      <button 
        onClick={onSkipForward}
        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        aria-label="Siguiente canción"
      >
        <SkipForward size={28} />
      </button>
    </div>
  );
};