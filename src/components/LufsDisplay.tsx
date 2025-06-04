import React from 'react';
import type { LufsData } from './LufsAnalyzer.js';
import './LufsDisplay.css';

interface LufsDisplayProps {
  data: LufsData | null;
  isAnalyzing: boolean;
}

const LufsDisplay: React.FC<LufsDisplayProps> = ({ data, isAnalyzing }) => {
  const formatLufs = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '--';
    return value.toFixed(1);
  };

  const getLufsStatusColor = (value: number, target: number = -14): string => {
    if (isNaN(value) || !isFinite(value)) return 'gray';
    
    const diff = Math.abs(value - target);
    if (diff <= 1) return 'green';
    if (diff <= 3) return 'yellow';
    return 'red';
  };

  return (
    <div className="lufs-display">
      <h3>LUFS Measurements</h3>
      
      {isAnalyzing && !data && (
        <div className="analyzing-indicator">
          <div className="spinner"></div>
          <p>Analyzing audio...</p>
        </div>
      )}

      <div className="lufs-meters">
        <div className="lufs-meter integrated">
          <div className="meter-label">Integrated LUFS</div>
          <div className={`meter-value ${data ? getLufsStatusColor(data.integrated) : ''}`}>
            {data ? formatLufs(data.integrated) : '--'}
          </div>
          <div className="meter-unit">LUFS</div>
          <div className="meter-description">
            Overall loudness of the entire audio
          </div>
        </div>

        <div className="lufs-meter momentary">
          <div className="meter-label">Momentary LUFS</div>
          <div className={`meter-value ${data ? getLufsStatusColor(data.momentary) : ''}`}>
            {data ? formatLufs(data.momentary) : '--'}
          </div>
          <div className="meter-unit">LUFS</div>
          <div className="meter-description">
            Loudness over the last 400ms
          </div>
        </div>

        <div className="lufs-meter short-term">
          <div className="meter-label">Short-term LUFS</div>
          <div className={`meter-value ${data ? getLufsStatusColor(data.shortTerm) : ''}`}>
            {data ? formatLufs(data.shortTerm) : '--'}
          </div>
          <div className="meter-unit">LUFS</div>
          <div className="meter-description">
            Loudness over the last 3 seconds
          </div>
        </div>

        <div className="lufs-meter range">
          <div className="meter-label">Loudness Range</div>
          <div className="meter-value">
            {data ? formatLufs(data.range) : '--'}
          </div>
          <div className="meter-unit">LU</div>
          <div className="meter-description">
            Dynamic range of the audio
          </div>
        </div>
      </div>

      {data && (
        <div className="lufs-info">
          <h4>About LUFS Measurements:</h4>
          <ul>
            <li><strong>Integrated LUFS:</strong> The most important measurement for overall loudness</li>
            <li><strong>Momentary LUFS:</strong> Real-time loudness for live monitoring</li>
            <li><strong>Short-term LUFS:</strong> Recent loudness for quick adjustments</li>
            <li><strong>Loudness Range:</strong> Indicates how dynamic your audio is</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LufsDisplay;
