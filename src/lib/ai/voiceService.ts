// lib/ai/voiceService.ts

import { useState, useRef, useEffect, useCallback } from 'react';

const LOG_PREFIX = '[Voice]';

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleVoice: () => void;
  isSupported: boolean;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const onResultCallback = useRef<((text: string) => void) | null>(null);
  const initAttempted = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initAttempted.current) return;
    initAttempted.current = true;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    const supported = !!SpeechRecognition && hasSpeechSynthesis;
    setIsSupported(supported);

    if (!supported) {
      console.warn(`${LOG_PREFIX} Speech API not supported in this browser`);
      return;
    }

    console.log(`${LOG_PREFIX} Speech API supported`);

    try {
      synthRef.current = window.speechSynthesis;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log(`${LOG_PREFIX} Listening started`);
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        try {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          console.log(`${LOG_PREFIX} Recognized: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
          
          if (onResultCallback.current) {
            onResultCallback.current(transcript);
          }
        } catch (error: any) {
          console.error(`${LOG_PREFIX} Result processing error:`, error.message);
        }
      };

      recognition.onerror = (event: any) => {
        console.error(`${LOG_PREFIX} Recognition error:`, event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          console.warn(`${LOG_PREFIX} Microphone permission denied`);
        }
      };

      recognition.onend = () => {
        console.log(`${LOG_PREFIX} Listening ended`);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      console.log(`${LOG_PREFIX} Speech recognition initialized`);

    } catch (error: any) {
      console.error(`${LOG_PREFIX} Initialization error:`, error.message);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = useCallback((onResult?: (text: string) => void) => {
    if (!recognitionRef.current) {
      console.warn(`${LOG_PREFIX} Recognition not initialized`);
      return;
    }

    if (isListening) {
      console.warn(`${LOG_PREFIX} Already listening`);
      return;
    }

    if (onResult) {
      onResultCallback.current = onResult;
    }

    try {
      console.log(`${LOG_PREFIX} Starting recognition...`);
      recognitionRef.current.start();
    } catch (error: any) {
      console.error(`${LOG_PREFIX} Failed to start recognition:`, error.message);
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (!isListening) {
      console.warn(`${LOG_PREFIX} Not currently listening`);
      return;
    }

    try {
      console.log(`${LOG_PREFIX} Stopping recognition...`);
      recognitionRef.current.stop();
    } catch (error: any) {
      console.error(`${LOG_PREFIX} Failed to stop recognition:`, error.message);
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) {
      console.warn(`${LOG_PREFIX} Synthesis not initialized`);
      return;
    }

    if (!voiceEnabled) {
      console.log(`${LOG_PREFIX} Voice output disabled`);
      return;
    }

    if (!text.trim()) {
      console.warn(`${LOG_PREFIX} Empty text provided`);
      return;
    }

    try {
      synthRef.current.cancel();

      const speakWithVoice = () => {
        if (!synthRef.current) return;

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        const voices = synthRef.current.getVoices();
        
        if (voices.length > 0) {
          const preferredVoices = [
            'Google US English',
            'Microsoft Zira - English (United States)',
            'Samantha',
            'Karen',
            'Daniel',
          ];

          let selectedVoice = voices.find(voice => 
            preferredVoices.some(preferred => voice.name.includes(preferred))
          );

          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`${LOG_PREFIX} Using voice: ${selectedVoice.name}`);
          } else {
            console.log(`${LOG_PREFIX} Using default voice`);
          }
        }

        utterance.onstart = () => {
          console.log(`${LOG_PREFIX} Speaking started`);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log(`${LOG_PREFIX} Speaking ended`);
          setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
          console.error(`${LOG_PREFIX} Speech error:`, event.error);
          setIsSpeaking(false);
        };

        try {
          synthRef.current.speak(utterance);
          console.log(`${LOG_PREFIX} Speaking: "${text.substring(0, 50)}..."`);
        } catch (error: any) {
          console.error(`${LOG_PREFIX} Failed to speak:`, error.message);
          setIsSpeaking(false);
        }
      };

      const voices = synthRef.current.getVoices();
      if (voices.length === 0) {
        console.log(`${LOG_PREFIX} Waiting for voices to load...`);
        synthRef.current.onvoiceschanged = () => {
          console.log(`${LOG_PREFIX} Voices loaded: ${synthRef.current!.getVoices().length}`);
          speakWithVoice();
        };
      } else {
        speakWithVoice();
      }
    } catch (error: any) {
      console.error(`${LOG_PREFIX} Speak initialization error:`, error.message);
    }
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;

    try {
      console.log(`${LOG_PREFIX} Stopping speech...`);
      synthRef.current.cancel();
      setIsSpeaking(false);
    } catch (error: any) {
      console.error(`${LOG_PREFIX} Failed to stop speech:`, error.message);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    const newState = !voiceEnabled;
    console.log(`${LOG_PREFIX} Voice ${newState ? 'enabled' : 'disabled'}`);
    setVoiceEnabled(newState);
    
    if (!newState && isSpeaking) {
      stopSpeaking();
    }
  }, [voiceEnabled, isSpeaking, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    voiceEnabled,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoice,
    isSupported,
  };
}