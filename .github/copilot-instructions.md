# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a LUFS (Loudness Units relative to Full Scale) measurement web application built with React TypeScript frontend and Node.js/Express backend.

## Key Technologies
- **Frontend**: React, TypeScript, Vite, Web Audio API
- **Backend**: Node.js, Express, CORS, Multer
- **Audio Processing**: Needles library for LUFS measurement

## Project Structure
- Frontend React app serves the user interface
- Backend handles file uploads and serves the React app
- Real-time audio processing using Web Audio API
- LUFS measurement using the Needles library

## Key Features
- File upload for audio analysis
- Live microphone input processing
- Real-time LUFS measurement display
- Target LUFS setting with visual feedback
- Suggestions for volume adjustments

## Code Style Guidelines
- Use TypeScript for type safety
- Follow React functional component patterns with hooks
- Implement proper error handling for audio operations
- Use modern ES6+ syntax
- Ensure responsive design for various screen sizes
