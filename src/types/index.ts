// Shared types for LUFS measurement application

export interface LufsData {
  integrated: number;
  momentary: number;
  shortTerm: number;
  range: number;
}

export interface LufsMeasurement {
  momentary: number;
  shortTerm: number;
  integrated: number;
  peak: number;
}

export type AnalysisMode = 'upload' | 'live';

export interface AudioUploadProps {
  onFileAnalysis: (arrayBuffer: ArrayBuffer) => void;
  isAnalyzing: boolean;
}

export interface LiveInputProps {
  onStreamReady: (stream: MediaStream) => void;
  onStop: () => void;
  isAnalyzing: boolean;
}

export interface LufsDisplayProps {
  data: LufsData | null;
  isAnalyzing: boolean;
}

export interface TargetLufsInputProps {
  value: number;
  onChange: (value: number) => void;
}

export interface VolumeGuidanceProps {
  currentLufs: number;
  targetLufs: number;
}
