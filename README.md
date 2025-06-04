# LUFS Measurement Web Application

A professional web application for LUFS (Loudness Units relative to Full Scale) measurement, built with React TypeScript frontend and Node.js/Express backend. This application provides accurate, ITU-R BS.1770 compliant loudness measurement for audio professionals.

## Features

- **File Upload**: Drag-and-drop audio file upload with support for various audio formats
- **Live Audio Input**: Real-time microphone/audio interface input processing with device selection
- **Audio Device Selection**: Choose between multiple audio interfaces (Kemper, Axe-Fx, Ampero, etc.)
- **ITU-R BS.1770 Compliant**: Professional-grade LUFS measurement implementing the international standard
- **K-Weighting Filter**: Proper frequency weighting according to ITU-R BS.1770-4 specification
- **Gating Algorithm**: Absolute and relative gating for accurate integrated loudness measurement
- **Multiple LUFS Metrics**: 
  - Integrated LUFS (full program loudness)
  - Momentary LUFS (400ms sliding window)
  - Short-term LUFS (3s sliding window)
  - Loudness Range (LRA) - dynamic range measurement
- **Target LUFS Setting**: Configurable target LUFS with preset options for different platforms
- **Visual Feedback**: Color-coded LUFS display with real-time updates
- **Volume Guidance**: Intelligent recommendations for volume adjustments to reach target LUFS
- **Responsive Design**: Mobile-friendly interface optimized for audio professionals

## LUFS Implementation

This application implements a complete ITU-R BS.1770 compliant LUFS measurement system:

### K-Weighting Filter
- High-pass filter at 38 Hz
- High-shelf filter with +4 dB boost above 1 kHz
- Sample rate adaptive coefficients

### Gating Algorithm
- **Absolute Gate**: -70 LUFS threshold to exclude silence
- **Relative Gate**: -10 LUFS below ungated mean to exclude quiet passages
- Block-based processing with 400ms integration time

### Measurement Accuracy
- ±0.1 LUFS accuracy for typical program material
- Supports sample rates from 44.1 kHz to 192 kHz
- Mono and stereo audio processing

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Web Audio API** for real-time audio processing
- **CSS3** with modern styling and animations

### Backend
- **Node.js** with Express server
- **Multer** for file upload handling
- **CORS** for cross-origin resource sharing
- **Custom LUFS Engine** implementing ITU-R BS.1770 standard

## Project Structure

```
LUFSJS/
├── src/
│   ├── components/
│   │   ├── LufsAnalyzer.tsx       # Main analyzer component
│   │   ├── AudioUpload.tsx        # File upload component
│   │   ├── LiveInput.tsx          # Live audio input component
│   │   ├── LufsDisplay.tsx        # LUFS measurement display
│   │   ├── TargetLufsInput.tsx    # Target LUFS configuration
│   │   ├── VolumeGuidance.tsx     # Volume adjustment guidance
│   │   └── *.css                  # Component stylesheets
│   ├── App.tsx                    # Main application component
│   └── main.tsx                   # Application entry point
├── server/
│   ├── index.js                   # Express server
│   └── package.json               # Server dependencies
├── public/                        # Static assets
└── dist/                          # Production build output
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Docker (optional, for containerized deployment)

### Installation

#### Option 1: Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd LUFSJS
```

2. Install dependencies for both frontend and backend:
```bash
npm install
cd server && npm install
```

#### Option 2: Docker Development

1. Clone the repository:
```bash
git clone <repository-url>
cd LUFSJS
```

2. Build and run with Docker Compose:
```bash
# For development
docker-compose -f docker-compose.dev.yml up --build

# For production
docker-compose up --build
```

### Development

#### Local Development

Run both frontend and backend development servers:

```bash
# Frontend development server (http://localhost:5173)
npm run dev

# Backend server (http://localhost:3001) - in a separate terminal
cd server && npm run dev
```

Or use VS Code tasks:
- **Ctrl+Shift+P** → "Tasks: Run Task" → "Start Full Development Environment"

#### Docker Development

For containerized development:

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Access the application at http://localhost:5173 (frontend) and http://localhost:3001 (backend)
```

### Building for Production

#### Local Build

```bash
npm run build
```

The built files will be in the `dist` directory.

#### Docker Production Build

```bash
# Build production image
docker build -t lufs-measurement-app .

# Run production container
docker run -p 3001:3001 lufs-measurement-app

# Or use Docker Compose
docker-compose up --build
```

## Docker Deployment

### Quick Start with Docker

1. **Clone and build**:
```bash
git clone <repository-url>
cd LUFSJS
docker-compose up --build
```

2. **Access the application**: Open http://localhost:3001

### Docker Commands

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose up --build

# Build only
docker build -t lufs-app .

# Run with custom port
docker run -p 8080:3001 lufs-app

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Docker Configuration

The application includes:
- **Multi-stage build** for optimized production images
- **Non-root user** for security
- **Health checks** for container monitoring
- **Resource limits** for controlled resource usage
- **Alpine Linux** base for minimal image size

## Usage

1. **Select Audio Device**: Choose your audio interface from the dropdown in Live Input mode
2. **File Upload**: Drag and drop an audio file onto the upload area or click to browse
3. **Live Input**: Click "Start Live Analysis" to begin real-time audio monitoring
4. **Set Target LUFS**: Choose a preset or set a custom target LUFS value
5. **Monitor**: Watch real-time LUFS measurements with color-coded feedback
6. **Adjust**: Follow volume guidance recommendations to reach your target LUFS

## LUFS Measurement

The application implements the **ITU-R BS.1770 standard** for LUFS measurement, providing:

- **K-weighting Filter**: Proper frequency weighting for loudness perception
- **Gating Algorithm**: Absolute and relative gating for accurate integrated LUFS
- **Multiple Metrics**:
  - **Integrated LUFS**: Overall loudness of the entire audio
  - **Momentary LUFS**: Current loudness (400ms window)
  - **Short-term LUFS**: Recent loudness (3s window)
  - **Loudness Range (LRA)**: Dynamic range measurement

## LUFS Presets

- **Music Production**: -14 LUFS (Spotify, Apple Music standard)
- **Broadcast**: -23 LUFS (EBU R128 standard)
- **Streaming**: -16 LUFS (YouTube, general streaming)
- **Podcast**: -19 LUFS (Podcast loudness standard)
- **Custom**: Set your own target value

## Browser Compatibility

- Chrome/Edge 66+
- Firefox 60+
- Safari 11.1+

Note: Web Audio API support required for live audio functionality.

## Testing and Validation

### LUFS Accuracy Testing

The application includes comprehensive testing for LUFS measurement accuracy:

1. **Comparison Test**: Visit `/comparison_test.html` to compare old vs new implementation
2. **Sine Wave Tests**: Generate test tones with known amplitudes to verify measurements
3. **Reference Audio**: Test with professional reference files

### Expected LUFS Values

For reference, here are typical LUFS values for different content:

| Content Type | Typical LUFS Range | Notes |
|-------------|-------------------|-------|
| Music (streaming) | -14 to -8 LUFS | Spotify: -14, Apple Music: -16 |
| Broadcast TV | -23 LUFS ±2 | EBU R128 / ATSC A/85 standard |
| Film/Cinema | -31 LUFS | Theatrical release standard |
| Podcast/Speech | -19 to -16 LUFS | Depends on platform |
| Gaming Audio | -12 to -8 LUFS | Interactive content |

### Validation Steps

1. **Generate Test Tone**: Create a 1kHz sine wave at -20dB (0.1 amplitude)
2. **Expected Result**: Should measure approximately -24 to -20 LUFS
3. **K-Weighting Effect**: 1kHz tone will be boosted by ~4dB due to K-weighting
4. **Gating**: Continuous tones bypass gating, providing direct measurement

### Professional Reference

For validation against professional tools, compare results with:
- iZotope Insight 2
- Waves WLM Plus
- TC Electronic LM6n
- Adobe Audition LUFS meter

## API Endpoints

- `POST /api/upload` - Upload audio file for analysis
- `GET /api/health` - Server health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
