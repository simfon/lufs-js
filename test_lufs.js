// Test script to validate LUFS implementation
const fs = require('fs');

// Generate a simple sine wave test tone
function generateTestTone(sampleRate = 48000, duration = 5, frequency = 1000, amplitude = 0.5) {
    const samples = sampleRate * duration;
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
        buffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    return buffer;
}

// Convert float32 to 16-bit PCM WAV
function createWav(audioBuffer, sampleRate = 48000) {
    const length = audioBuffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }
    
    return new Uint8Array(arrayBuffer);
}

// Test with different amplitudes to verify LUFS calculations
const testCases = [
    { amplitude: 0.1, expectedLufs: -20 }, // Approximate expected LUFS
    { amplitude: 0.316, expectedLufs: -10 },
    { amplitude: 0.5, expectedLufs: -6 },
];

console.log('Generating test audio files...');

testCases.forEach((testCase, index) => {
    const audioBuffer = generateTestTone(48000, 5, 1000, testCase.amplitude);
    const wavData = createWav(audioBuffer, 48000);
    
    const filename = `test_tone_${testCase.amplitude}_amp.wav`;
    fs.writeFileSync(filename, wavData);
    
    console.log(`Generated ${filename} with amplitude ${testCase.amplitude} (expected ~${testCase.expectedLufs} LUFS)`);
});

console.log('Test files generated successfully!');
