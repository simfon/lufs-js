import React from 'react';
import './VolumeGuidance.css';

interface VolumeGuidanceProps {
  currentLufs: number;
  targetLufs: number;
}

const VolumeGuidance: React.FC<VolumeGuidanceProps> = ({ currentLufs, targetLufs }) => {
  const difference = currentLufs - targetLufs;
  const absDifference = Math.abs(difference);
  
  const getGuidanceMessage = (): { message: string; action: string; severity: 'good' | 'warning' | 'critical' } => {
    if (absDifference <= 0.5) {
      return {
        message: 'Perfect! Your audio is at the target loudness.',
        action: 'No adjustment needed',
        severity: 'good'
      };
    } else if (absDifference <= 1.5) {
      return {
        message: difference > 0 
          ? 'Audio is slightly too loud' 
          : 'Audio is slightly too quiet',
        action: difference > 0 
          ? `Decrease volume by approximately ${absDifference.toFixed(1)} dB`
          : `Increase volume by approximately ${absDifference.toFixed(1)} dB`,
        severity: 'warning'
      };
    } else {
      return {
        message: difference > 0 
          ? 'Audio is significantly too loud' 
          : 'Audio is significantly too quiet',
        action: difference > 0 
          ? `Decrease volume by approximately ${absDifference.toFixed(1)} dB`
          : `Increase volume by approximately ${absDifference.toFixed(1)} dB`,
        severity: 'critical'
      };
    }
  };

  const guidance = getGuidanceMessage();
  
  const getArrowDirection = (): string => {
    if (absDifference <= 0.5) return '✓';
    return difference > 0 ? '⬇️' : '⬆️';
  };

  const getProgressBarWidth = (): number => {
    // Scale the difference to a percentage (0-100%)
    // Using a range of -6 to +6 LUFS for visualization
    const normalizedDiff = Math.max(-6, Math.min(6, difference));
    return ((normalizedDiff + 6) / 12) * 100;
  };

  return (
    <div className={`volume-guidance ${guidance.severity}`}>
      <div className="guidance-header">
        <h3>Volume Adjustment Guidance</h3>
        <div className="arrow-indicator">
          {getArrowDirection()}
        </div>
      </div>

      <div className="guidance-content">
        <div className="guidance-message">
          <p className="message">{guidance.message}</p>
          <p className="action">{guidance.action}</p>
        </div>
        <div className="lufs-comparison">
          <div className="current-lufs">
            <span className="label">Current:</span>
            <span className="value">{currentLufs.toFixed(1)} LUFS</span>
          </div>
          <div className="target-lufs">
            <span className="label">Target:</span>
            <span className="value">{targetLufs.toFixed(1)} LUFS</span>
          </div>
          <div className="difference">
            <span className="label">Difference:</span>
            <span className={`value ${difference > 0 ? 'positive' : 'negative'}`}>
              {difference > 0 ? '+' : ''}{difference.toFixed(1)} dB
            </span>
          </div>
        </div>

       {/*  <div className="progress-bar">
          <div className="progress-track">
            <div className="target-marker"></div>
            <div 
              className="progress-fill"
              style={{ width: `${getProgressBarWidth()}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>Too Quiet</span>
            <span>Target</span>
            <span>Too Loud</span>
          </div>
        </div> */}

        {/* <div className="device-instructions">
          <h4>How to adjust on your device:</h4>
          <ul>
            <li><strong>Kemper:</strong> Use the Master Volume or Output settings</li>
            <li><strong>Axe-Fx:</strong> Adjust the Output Level in the I/O menu</li>
            <li><strong>Ampero:</strong> Use the Master Volume control</li>
            <li><strong>General:</strong> Adjust your audio interface input gain</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default VolumeGuidance;
