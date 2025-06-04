import React, { useState, useRef, useCallback, useEffect } from 'react';
import AudioUpload from './AudioUpload.js';
import LiveInput from './LiveInput.js';
import LufsDisplay from './LufsDisplay.js';
import TargetLufsInput from './TargetLufsInput.js';
import VolumeGuidance from './VolumeGuidance.js';
import { LufsCalculator } from '../utils/lufs.js';
import './LufsAnalyzer.css';

export interface LufsData {
  integrated: number;
  momentary: number;
  shortTerm: number;
  range: number;
}

const LufsAnalyzer: React.FC = () => {
  const [targetLufs, setTargetLufs] = useState<number>(-14);
  const [currentLufs, setCurrentLufs] = useState<LufsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'live'>('upload');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerNodeRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lufsCalculatorRef = useRef<LufsCalculator | null>(null);

  // Initialize LUFS calculator
  const initializeLufsCalculator = useCallback(() => {
    if (!lufsCalculatorRef.current) {
      const sampleRate = audioContextRef.current?.sampleRate || 48000;
      lufsCalculatorRef.current = new LufsCalculator(sampleRate);
    }
    return lufsCalculatorRef.current;
  }, []);

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      return audioContextRef.current;
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      setError('Failed to initialize audio system');
      return null;
    }
  }, []);

  // Process audio data and calculate LUFS approximation
  const processAudioData = useCallback((audioData: Float32Array) => {
    const calculator = initializeLufsCalculator();
    
    // Process the audio block
    calculator.processAudioBlock(audioData);
    
    // Get current measurements
    const measurement = calculator.getCurrentMeasurement();
    
    const lufsData: LufsData = {
      integrated: measurement.integrated,
      momentary: measurement.momentary,
      shortTerm: measurement.shortTerm,
      range: measurement.range
    };
    
    setCurrentLufs(lufsData);
  }, [initializeLufsCalculator]);

  // Start real-time analysis
  const startAnalysis = useCallback(async (source: AudioNode) => {
    const audioContext = await initializeAudioContext();
    if (!audioContext) return;

    try {
      // Create analyzer node
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      
      // Connect source to analyzer
      source.connect(analyzer);
      
      analyzerNodeRef.current = analyzer;
      setIsAnalyzing(true);
      setError(null);

      // Analysis loop
      const analyze = () => {
        if (!analyzerNodeRef.current) return;
        
        const bufferLength = analyzerNodeRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyzerNodeRef.current.getFloatTimeDomainData(dataArray);
        
        processAudioData(dataArray);
        
        animationFrameRef.current = requestAnimationFrame(analyze);
      };
      
      analyze();
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to start audio analysis');
      setIsAnalyzing(false);
    }
  }, [initializeAudioContext, processAudioData]);

  // Process uploaded audio file
  const handleFileAnalysis = useCallback(async (arrayBuffer: ArrayBuffer) => {
    const audioContext = await initializeAudioContext();
    if (!audioContext) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Use LUFS calculator for full buffer analysis
      const calculator = new LufsCalculator(audioBuffer.sampleRate);
      const measurement = calculator.processAudioBuffer(audioBuffer);
      
      const lufsData: LufsData = {
        integrated: measurement.integrated,
        momentary: measurement.momentary,
        shortTerm: measurement.shortTerm,
        range: measurement.range
      };
      
      setCurrentLufs(lufsData);

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze audio file');
    } finally {
      setIsAnalyzing(false);
    }
  }, [initializeAudioContext]);

  // Handle live audio input
  const handleLiveInput = useCallback(async (stream: MediaStream) => {
    const audioContext = await initializeAudioContext();
    if (!audioContext) return;

    try {
      const source = audioContext.createMediaStreamSource(stream);
      await startAnalysis(source);
    } catch (err) {
      console.error('Live input error:', err);
      setError('Failed to start live audio analysis');
      setIsAnalyzing(false);
    }
  }, [initializeAudioContext, startAnalysis]);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnalyzing(false);
    setCurrentLufs(null);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAnalysis]);

  return (
    <div className="lufs-analyzer">
      <div className="analyzer-header">
        <p><h3>LUFS Audio Analyzer</h3></p>
        <div className="mode-selector">
          <button 
            className={`mode-btn ${analysisMode === 'upload' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('upload')}
          >
            File Upload
          </button>
          <button 
            className={`mode-btn ${analysisMode === 'live' ? 'active' : ''}`}
            onClick={() => setAnalysisMode('live')}
          >
            Live Input
          </button>
        </div>
        
        <TargetLufsInput 
          value={targetLufs} 
          onChange={setTargetLufs} 
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="analyzer-content">
        <div className="input-section">
          {analysisMode === 'upload' ? (
            <AudioUpload 
              onFileAnalysis={handleFileAnalysis}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <LiveInput 
              onStreamReady={handleLiveInput}
              onStop={stopAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}
        </div>

        <div className="results-section">
          <LufsDisplay 
            data={currentLufs}
            isAnalyzing={isAnalyzing}
          />
          
          {currentLufs && (
            <VolumeGuidance 
              currentLufs={currentLufs.integrated}
              targetLufs={targetLufs}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LufsAnalyzer;
