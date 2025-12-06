import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { parseVoiceInput, createTaskFromVoice } from '../store/slices/tasksSlice';
import VoicePreviewModal from './VoicePreviewModal';
import './VoiceInputButton.css';

const VoiceInputButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = async (event) => {
      const transcriptText = event.results[0][0].transcript;
      setTranscript(transcriptText);
      setIsRecording(false);
      recognition.stop();

      // Parse the transcript
      setIsProcessing(true);
      try {
        const result = await dispatch(parseVoiceInput(transcriptText)).unwrap();
        setParsedData(result);
        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing voice input:', error);
        alert('Failed to parse voice input. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please enable microphone access.');
      } else {
        alert('Speech recognition error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCreateTask = async (finalData) => {
    try {
      await dispatch(createTaskFromVoice({
        transcript: transcript,
        parsed: finalData
      })).unwrap();
      setShowPreview(false);
      setTranscript('');
      setParsedData(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setTranscript('');
    setParsedData(null);
  };

  return (
    <>
      <button
        className={`voice-btn ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
      >
        {isRecording ? (
          <>
            <FaMicrophoneSlash className="voice-icon" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <FaMicrophone className="voice-icon" />
            <span>Voice</span>
          </>
        )}
      </button>

      {showPreview && parsedData && (
        <VoicePreviewModal
          transcript={transcript}
          parsedData={parsedData.parsed}
          onConfirm={handleCreateTask}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default VoiceInputButton;



