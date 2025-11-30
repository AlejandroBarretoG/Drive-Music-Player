
import React, { useState } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { Music, Disc, KeyRound } from 'lucide-react';

// Playlist definition with the new links provided
const PLAYLIST = [
  {
    id: "1ggAUirIR71vPX0_0DHHOg9rrYsdTuAYW",
    title: "Canción 1",
    artist: "Google Drive Audio"
  },
  {
    id: "1xhgBc2F6S5G1gN7-5-AiqBmx4ZQ52Ex8",
    title: "Canción 2",
    artist: "Google Drive Audio"
  }
];

const App: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentTrack = PLAYLIST[currentTrackIndex];
  
  // ---------------------------------------------------------------------------
  // API KEY CONFIGURATION
  // ---------------------------------------------------------------------------
  const GOOGLE_DRIVE_API_KEY: string = "AIzaSyB9IR6S_XDeHdqWQUsfwNE55S7LazuflOw";
  
  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-8 flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex justify-between items-center mb-8 text-white/50">
            <Music size={20} />
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-widest font-semibold">Reproductor Drive</span>
              {GOOGLE_DRIVE_API_KEY && (
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <KeyRound size={8} /> API Activa
                </span>
              )}
            </div>
            <Disc size={20} className="animate-spin-slow" style={{ animationDuration: '10s' }} />
          </div>

          {/* Player Component */}
          <AudioPlayer 
            fileId={currentTrack.id}
            apiKey={GOOGLE_DRIVE_API_KEY}
            trackTitle={currentTrack.title} 
            trackArtist={currentTrack.artist}
            onNextTrack={handleNextTrack}
            onPrevTrack={handlePrevTrack}
          />
          
          <div className="mt-6 flex justify-center gap-2">
            {PLAYLIST.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentTrackIndex ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-600'}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
