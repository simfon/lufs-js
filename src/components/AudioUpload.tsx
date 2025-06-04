import React, { useRef, useState } from 'react';
import './AudioUpload.css';

interface AudioUploadProps {
  onFileAnalysis: (arrayBuffer: ArrayBuffer) => void;
  isAnalyzing: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onFileAnalysis, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    setSelectedFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      onFileAnalysis(arrayBuffer);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading audio file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-upload">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={isAnalyzing}
        />
        
        <div className="upload-content">
          {isAnalyzing ? (
            <>
              <div className="upload-spinner"></div>
              <p>Analyzing audio...</p>
              {selectedFile && <p className="file-name">{selectedFile.name}</p>}
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <p>Drop audio file here or click to browse</p>
              <p className="supported-formats">Supports: MP3, WAV, FLAC, AAC, OGG</p>
              {selectedFile && (
                <p className="file-name">Selected: {selectedFile.name}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioUpload;
