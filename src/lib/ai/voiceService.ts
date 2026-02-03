// lib/ai/voiceService.ts

import { useState, useRef, useEffect, useCallback } from "react";

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
    if (typeof window === "undefined" || initAttempted.current) return;
    initAttempted.current = true;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const hasSpeechSynthesis = "speechSynthesis" in window;

    const supported = !!SpeechRecognition && hasSpeechSynthesis;
    setIsSupported(supported);

    if (!supported) {
      return;
    }

    try {
      synthRef.current = window.speechSynthesis;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        try {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;

          if (onResultCallback.current) {
            onResultCallback.current(transcript);
          }
        } catch (error: any) {}
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);

        if (event.error === "not-allowed") {
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (error: any) {
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

  const startListening = useCallback(
    (onResult?: (text: string) => void) => {
      if (!recognitionRef.current) {
        return;
      }

      if (isListening) {
        return;
      }

      if (onResult) {
        onResultCallback.current = onResult;
      }

      try {
        recognitionRef.current.start();
      } catch (error: any) {
        setIsListening(false);
      }
    },
    [isListening],
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (!isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error: any) {
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        return;
      }

      if (!voiceEnabled) {
        return;
      }

      if (!text.trim()) {
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
          utterance.lang = "en-US";

          const voices = synthRef.current.getVoices();

          if (voices.length > 0) {
            const preferredVoices = [
              "Google US English",
              "Microsoft Zira - English (United States)",
              "Samantha",
              "Karen",
              "Daniel",
            ];

            let selectedVoice = voices.find((voice) =>
              preferredVoices.some((preferred) =>
                voice.name.includes(preferred),
              ),
            );

            if (!selectedVoice) {
              selectedVoice = voices.find((voice) =>
                voice.lang.startsWith("en"),
              );
            }

            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
          };

          utterance.onend = () => {
            setIsSpeaking(false);
          };

          utterance.onerror = (event) => {
            setIsSpeaking(false);
          };

          try {
            synthRef.current.speak(utterance);
          } catch (error: any) {
            setIsSpeaking(false);
          }
        };

        const voices = synthRef.current.getVoices();
        if (voices.length === 0) {
          synthRef.current.onvoiceschanged = () => {
            speakWithVoice();
          };
        } else {
          speakWithVoice();
        }
      } catch (error: any) {}
    },
    [voiceEnabled],
  );

  const stopSpeaking = useCallback(() => {
    if (!synthRef.current) return;

    try {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } catch (error: any) {}
  }, []);

  const toggleVoice = useCallback(() => {
    const newState = !voiceEnabled;
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
