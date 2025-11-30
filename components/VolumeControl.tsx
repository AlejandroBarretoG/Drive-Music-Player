import React from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { VolumeControlProps } from '../types';

export const VolumeControl: React.FC<VolumeControlProps> = ({ 
  volume, 
  muted, 
  onVolumeChange, 
  onToggleMute 
}) => {
  
  const getIcon = () => {
    if (muted || volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-[200px]">
      <button 
        onClick={onToggleMute}
        className="text-slate-400 hover:text-white transition-colors"
      >
        {getIcon()}
      </button>
      
      <div className="relative h-1.5 flex-1 rounded-full bg-slate-700/50 cursor-pointer group">
        <div 
          className="absolute top-0 left-0 h-full bg-slate-400 group-hover:bg-cyan-400 rounded-full transition-colors"
          style={{ width: `${muted ? 0 : volume * 100}%` }}
        ></div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};