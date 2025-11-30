export interface AudioPlayerProps {
  src: string;
  trackTitle?: string;
  trackArtist?: string;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
}

export interface ProgressBarProps {
  current: number;
  duration: number;
  onSeek: (value: number) => void;
}

export interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
}

export interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}