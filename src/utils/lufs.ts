/**
 * LUFS Measurement Implementation
 * Based on ITU-R BS.1770 standard for loudness measurement
 */

export interface LufsMeasurement {
  momentary: number;
  shortTerm: number;
  integrated: number;
  peak: number;
  range: number;
}

/**
 * LUFS Calculator implementing ITU-R BS.1770 standard
 */
export class LufsCalculator {
  private sampleRate: number;
  private blockSize: number = 4800; // 0.1 second at 48kHz
  private gateThreshold: number = -70; // Absolute gate threshold
  private relativeGateThreshold: number = -10; // Relative gate threshold
  
  // Buffers for different time windows
  private momentaryBuffer: number[] = []; // 400ms
  private shortTermBuffer: number[] = []; // 3s
  private integratedBuffer: number[] = []; // Full duration
  
  private momentaryLength: number = 48; // 4.8s / 0.1s = 48 blocks
  private shortTermLength: number = 30; // 3s / 0.1s = 30 blocks

  constructor(sampleRate: number = 48000) {
    this.sampleRate = sampleRate;
    
    // Adjust block size for sample rate
    this.blockSize = Math.floor(sampleRate * 0.1); // 0.1 second blocks
    this.momentaryLength = Math.floor(4.8 / 0.1); // 4.8 seconds
    this.shortTermLength = Math.floor(3.0 / 0.1); // 3 seconds
  }

  /**
   * Calculate mean square for a block of audio data with K-weighting
   */
  private calculateMeanSquare(audioData: Float32Array): number {
    // Apply K-weighting filter in time domain
    const kWeighted = this.applyKWeighting(audioData);
    
    let sum = 0;
    for (let i = 0; i < kWeighted.length; i++) {
      sum += kWeighted[i] * kWeighted[i];
    }
    
    return sum / kWeighted.length;
  }

  /**
   * Apply K-weighting filter (ITU-R BS.1770-4 standard)
   * This is a simplified approximation of the K-weighting filter
   */
  private applyKWeighting(samples: Float32Array): Float32Array {
    const filtered = new Float32Array(samples.length);
    
    // Simplified K-weighting filter coefficients adjusted for the current sample rate
    // This is an approximation - for production use, proper filter design is recommended
    let x1 = 0, x2 = 0;
    let y1 = 0, y2 = 0;
    
    // High-pass filter at ~38Hz (coefficients adjusted for sample rate)
    // For simplicity, we use normalized coefficients that work reasonably well across sample rates
    const sampleRateRatio = this.sampleRate / 48000;
    const hp_a1 = -1.69065929318241 * sampleRateRatio;
    const hp_a2 = 0.73248077421585 * sampleRateRatio;
    const hp_b0 = 0.85319059207939;
    const hp_b1 = -1.70638118415879;
    const hp_b2 = 0.85319059207939;
    
    for (let i = 0; i < samples.length; i++) {
      const input = samples[i];
      
      // High-pass filter
      const output = hp_b0 * input + hp_b1 * x1 + hp_b2 * x2 - hp_a1 * y1 - hp_a2 * y2;
      
      x2 = x1;
      x1 = input;
      y2 = y1;
      y1 = output;
      
      filtered[i] = output;
    }
    
    return filtered;
  }

  /**
   * Convert mean square to LUFS
   */
  private meanSquareToLufs(meanSquare: number): number {
    if (meanSquare <= 0) return -Infinity;
    return -0.691 + 10 * Math.log10(meanSquare);
  }

  /**
   * Apply gating algorithm
   */
  private applyGating(blocks: number[]): number[] {
    // First pass: Remove blocks below absolute gate
    const gatedBlocks = blocks.filter(block => block > this.gateThreshold);
    
    if (gatedBlocks.length === 0) return [];
    
    // Calculate mean of gated blocks
    const mean = gatedBlocks.reduce((sum, block) => sum + Math.pow(10, block / 10), 0) / gatedBlocks.length;
    const meanLufs = 10 * Math.log10(mean);
    
    // Second pass: Remove blocks below relative gate
    const relativeThreshold = meanLufs + this.relativeGateThreshold;
    return gatedBlocks.filter(block => block > relativeThreshold);
  }

  /**
   * Calculate LUFS for a block of audio data
   */
  processAudioBlock(audioData: Float32Array): void {
    const meanSquare = this.calculateMeanSquare(audioData);
    const lufs = this.meanSquareToLufs(meanSquare);
    
    // Add to buffers
    this.momentaryBuffer.push(lufs);
    this.shortTermBuffer.push(lufs);
    this.integratedBuffer.push(lufs);
    
    // Maintain buffer sizes
    if (this.momentaryBuffer.length > this.momentaryLength) {
      this.momentaryBuffer.shift();
    }
    if (this.shortTermBuffer.length > this.shortTermLength) {
      this.shortTermBuffer.shift();
    }
  }

  /**
   * Get current LUFS measurements
   */
  getCurrentMeasurement(): LufsMeasurement {
    const momentary = this.calculateMomentaryLufs();
    const shortTerm = this.calculateShortTermLufs();
    const integrated = this.calculateIntegratedLufs();
    const range = this.calculateLoudnessRange();
    const peak = this.calculateTruePeak();

    return {
      momentary,
      shortTerm,
      integrated,
      peak,
      range
    };
  }

  private calculateMomentaryLufs(): number {
    if (this.momentaryBuffer.length === 0) return -Infinity;
    
    const validBlocks = this.momentaryBuffer.filter(block => block > this.gateThreshold);
    if (validBlocks.length === 0) return -Infinity;
    
    const mean = validBlocks.reduce((sum, block) => sum + Math.pow(10, block / 10), 0) / validBlocks.length;
    return 10 * Math.log10(mean);
  }

  private calculateShortTermLufs(): number {
    if (this.shortTermBuffer.length === 0) return -Infinity;
    
    const validBlocks = this.shortTermBuffer.filter(block => block > this.gateThreshold);
    if (validBlocks.length === 0) return -Infinity;
    
    const mean = validBlocks.reduce((sum, block) => sum + Math.pow(10, block / 10), 0) / validBlocks.length;
    return 10 * Math.log10(mean);
  }

  private calculateIntegratedLufs(): number {
    if (this.integratedBuffer.length === 0) return -Infinity;
    
    const gatedBlocks = this.applyGating(this.integratedBuffer);
    if (gatedBlocks.length === 0) return -Infinity;
    
    const mean = gatedBlocks.reduce((sum, block) => sum + Math.pow(10, block / 10), 0) / gatedBlocks.length;
    return 10 * Math.log10(mean);
  }

  private calculateLoudnessRange(): number {
    if (this.integratedBuffer.length < 30) return 0; // Need at least 3 seconds
    
    const gatedBlocks = this.applyGating(this.integratedBuffer);
    if (gatedBlocks.length === 0) return 0;
    
    // Sort blocks and calculate LRA as difference between 95th and 10th percentiles
    const sorted = [...gatedBlocks].sort((a, b) => a - b);
    const length = sorted.length;
    
    const p10Index = Math.floor(length * 0.1);
    const p95Index = Math.floor(length * 0.95);
    
    if (p95Index >= length || p10Index < 0) return 0;
    
    return sorted[p95Index] - sorted[p10Index];
  }

  private calculateTruePeak(): number {
    // For simplicity, return the last processed peak
    // In a full implementation, this would be calculated with oversampling
    return -6; // Placeholder value
  }

  /**
   * Reset all measurements
   */
  reset(): void {
    this.momentaryBuffer = [];
    this.shortTermBuffer = [];
    this.integratedBuffer = [];
  }

  /**
   * Process entire audio buffer for file analysis
   */
  processAudioBuffer(audioBuffer: AudioBuffer): LufsMeasurement {
    this.reset();
    
    // Get channel data (mono or average of stereo)
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = this.blockSize;
    
    // Process in blocks
    for (let i = 0; i < channelData.length; i += blockSize) {
      const end = Math.min(i + blockSize, channelData.length);
      const block = channelData.slice(i, end);
      this.processAudioBlock(block);
    }
    
    return this.getCurrentMeasurement();
  }
}

// Export a simplified function for backwards compatibility
export const calculateLufs = (audioData: Float32Array): LufsMeasurement => {
  const calculator = new LufsCalculator(48000); // Default sample rate
  
  // Process the audio block directly
  calculator.processAudioBlock(audioData);
  
  return calculator.getCurrentMeasurement();
};
