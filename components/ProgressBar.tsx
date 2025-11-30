import React from 'react';
import { ProgressBarProps } from '../types';
import { formatTime } from '../utils';

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, duration, onSeek }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const progressPercent = duration ? (current / duration) * 100 : 0;

  return (
    <div className="w-full mb-6 group">
      {/* Time Display */}
      <div className="flex justify-between text-xs text-slate-300 font-medium mb-2 font-mono">
        <span>{formatTime(current)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Slider */}
      <div className="relative h-2 w-full rounded-full bg-slate-700/50 cursor-pointer overflow-hidden">
        {/* Track Background */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
        
        {/* Input Range (Invisible but functional) */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={current}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};