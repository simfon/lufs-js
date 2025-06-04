import { LufsCalculator } from './src/utils/lufs.js';

// Test our LUFS implementation with known reference values
async function testLufsImplementation() {
    console.log('Testing LUFS Implementation...\n');
    
    // Create a simple audio context for testing
    const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    
    // Test case 1: -20 dB sine wave (amplitude = 0.1)
    const duration = 5; // 5 seconds
    const frequency = 1000; // 1kHz tone
    const amplitude = 0.1; // -20 dB
    
    console.log(`Test 1: ${frequency}Hz sine wave, ${amplitude} amplitude (-20dB)`);
    
    // Generate test audio
    const length = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        channelData[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    // Measure LUFS
    const calculator = new LufsCalculator(sampleRate);
    const measurement = calculator.processAudioBuffer(audioBuffer);
    
    console.log(`Sample Rate: ${sampleRate} Hz`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`RMS Level: ${(20 * Math.log10(amplitude)).toFixed(1)} dB`);
    console.log(`Integrated LUFS: ${measurement.integrated.toFixed(1)} LUFS`);
    console.log(`Loudness Range: ${measurement.range.toFixed(1)} LU`);
    console.log(`Momentary LUFS: ${measurement.momentary.toFixed(1)} LUFS`);
    console.log(`Short-term LUFS: ${measurement.shortTerm.toFixed(1)} LUFS\n`);
    
    // Test case 2: Higher amplitude
    const amplitude2 = 0.316; // approximately -10 dB
    console.log(`Test 2: ${frequency}Hz sine wave, ${amplitude2} amplitude (~-10dB)`);
    
    // Generate second test audio
    for (let i = 0; i < length; i++) {
        channelData[i] = amplitude2 * Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    const measurement2 = calculator.processAudioBuffer(audioBuffer);
    
    console.log(`RMS Level: ${(20 * Math.log10(amplitude2)).toFixed(1)} dB`);
    console.log(`Integrated LUFS: ${measurement2.integrated.toFixed(1)} LUFS`);
    console.log(`Loudness Range: ${measurement2.range.toFixed(1)} LU\n`);
    
    // Expected results analysis
    console.log('=== ANALYSIS ===');
    console.log('For a sine wave, the LUFS measurement should be approximately:');
    console.log('LUFS ≈ RMS_dB - 3 to 5 dB (depending on K-weighting effect)');
    console.log(`Test 1 expected: ~${(20 * Math.log10(amplitude) - 4).toFixed(1)} LUFS`);
    console.log(`Test 1 actual: ${measurement.integrated.toFixed(1)} LUFS`);
    console.log(`Test 2 expected: ~${(20 * Math.log10(amplitude2) - 4).toFixed(1)} LUFS`);
    console.log(`Test 2 actual: ${measurement2.integrated.toFixed(1)} LUFS`);
    
    // Verify measurements are reasonable
    const test1Expected = 20 * Math.log10(amplitude) - 4;
    const test2Expected = 20 * Math.log10(amplitude2) - 4;
    const tolerance = 5; // 5 dB tolerance
    
    const test1Valid = Math.abs(measurement.integrated - test1Expected) < tolerance;
    const test2Valid = Math.abs(measurement2.integrated - test2Expected) < tolerance;
    
    console.log('\n=== VALIDATION ===');
    console.log(`Test 1 ${test1Valid ? 'PASSED' : 'FAILED'} (within ${tolerance} dB tolerance)`);
    console.log(`Test 2 ${test2Valid ? 'PASSED' : 'FAILED'} (within ${tolerance} dB tolerance)`);
    
    if (test1Valid && test2Valid) {
        console.log('\n✅ LUFS implementation appears to be working correctly!');
        console.log('The measurements are within expected ranges for the ITU-R BS.1770 standard.');
    } else {
        console.log('\n❌ LUFS implementation may need adjustment.');
        console.log('Measurements are outside expected ranges.');
    }
    
    await audioContext.close();
}

// Run the test
testLufsImplementation().catch(console.error);
