import React from 'react';
import './TargetLufsInput.css';

interface TargetLufsInputProps {
  value: number;
  onChange: (value: number) => void;
}

const TargetLufsInput: React.FC<TargetLufsInputProps> = ({ value, onChange }) => {
  const presets = [
    { label: 'Spotify', value: -14, description: 'Streaming standard' },
    { label: 'YouTube', value: -13, description: 'Video platform' },
    { label: 'Apple Music', value: -16, description: 'Apple streaming' },
    { label: 'Broadcast', value: -23, description: 'TV/Radio standard' },
    { label: 'Mastering', value: -9, description: 'High impact' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
  };

  return (
    <div className="target-lufs-input">
      <div className="input-section">
        <label htmlFor="target-lufs">Target LUFS:</label>
        <input
          id="target-lufs"
          type="number"
          value={value}
          onChange={handleInputChange}
          step="0.1"
          min="-50"
          max="0"
          className="lufs-input"
        />
        <span className="unit">LUFS</span>
      </div>

      <div className="presets-section">
        <span className="presets-label">Presets:</span>
        <div className="presets-grid">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className={`preset-btn ${value === preset.value ? 'active' : ''}`}
              onClick={() => handlePresetClick(preset.value)}
              title={preset.description}
            >
              <span className="preset-label">{preset.label}</span>
              <span className="preset-value">{preset.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="target-info">
        <p>Set your target loudness based on your intended platform or use case.</p>
      </div>
    </div>
  );
};

export default TargetLufsInput;
