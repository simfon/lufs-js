import React, { useState, useRef, useEffect } from 'react';
import './LiveInput.css';

interface AudioDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

interface LiveInputProps {
  onStreamReady: (stream: MediaStream) => void;
  onStop: () => void;
  isAnalyzing: boolean;
}

const LiveInput: React.FC<LiveInputProps> = ({ onStreamReady, onStop, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Handle device change during recording
  const handleDeviceChange = async (newDeviceId: string) => {
    const wasRecording = isRecording;
    
    if (wasRecording) {
      // Stop current recording
      stopRecording();
      
      // Wait a moment for cleanup
      setTimeout(async () => {
        setSelectedDeviceId(newDeviceId);
        // Restart recording with new device
        if (wasRecording) {
          await startRecording();
        }
      }, 100);
    } else {
      setSelectedDeviceId(newDeviceId);
    }
  };

  // Enumerate available audio input devices
  const enumerateAudioDevices = async () => {
    try {
      setIsLoadingDevices(true);
      setError(null);
      
      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Audio Input ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId
        }));
      
      setAudioDevices(audioInputs);
      
      // If no device is selected and we have devices, select the first one
      if (selectedDeviceId === 'default' && audioInputs.length > 0) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
      
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Could not access audio devices. Please check permissions.');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedDeviceId !== 'default' ? { exact: selectedDeviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      setIsRecording(true);
      onStreamReady(stream);
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    onStop();
  };

  const startAudioLevelMonitoring = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyser);
    
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const level = rms / 255;
      
      setAudioLevel(level);
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  useEffect(() => {
    // Load available audio devices when component mounts
    enumerateAudioDevices();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="live-input">
      <div className="live-input-container">
        <div className="device-selection">
          <h3>Audio Input Device</h3>
          <div className="device-info">
            {audioDevices.length > 0 ? (
              <span className="device-count">{audioDevices.length} audio input{audioDevices.length !== 1 ? 's' : ''} detected</span>
            ) : (
              <span className="device-count">No audio inputs detected</span>
            )}
          </div>
          <div className="device-selector">
            <select 
              value={selectedDeviceId} 
              onChange={(e) => handleDeviceChange(e.target.value)}
              disabled={isLoadingDevices}
              className="device-dropdown"
            >
              <option value="default">Default Audio Input</option>
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <button 
              onClick={enumerateAudioDevices}
              disabled={isRecording || isLoadingDevices}
              className="refresh-devices-btn"
              title="Refresh device list"
            >
              {isLoadingDevices ? '⟳' : '🔄'}
            </button>
          </div>
        </div>

        <div className="microphone-section">
          <div className={`microphone-icon ${isRecording ? 'recording' : ''}`}>
            🎤
          </div>
          
          {isRecording && (
            <div className="audio-level-meter">
              <div className="level-bar">
                <div 
                  className="level-fill"
                  style={{ width: `${audioLevel * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          {!isRecording ? (
            <button 
              className="start-btn"
              onClick={startRecording}
              disabled={isAnalyzing}
            >
              Start Live Analysis
            </button>
          ) : (
            <button 
              className="stop-btn"
              onClick={stopRecording}
            >
              Stop Analysis
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* <div className="live-instructions">
          <h3>Live Audio Input</h3>
          <ul>
            <li>Select your audio interface from the dropdown above (Kemper, Axe-Fx, Ampero, etc.)</li>
            <li>If your device doesn't appear, click the refresh button or check connections</li>
            <li>Connect your guitar/patch to the selected audio interface</li>
            <li>Start live analysis and play to monitor real-time LUFS readings</li>
            <li>Adjust your device's output level based on the volume guidance</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default LiveInput;
