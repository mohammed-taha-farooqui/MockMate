/**
 * useSpeechRecognition.js
 * Custom React hook wrapping the browser Web Speech API (SpeechRecognition).
 *
 * Provides:
 *   - isSupported    — whether the browser supports the API
 *   - isListening    — whether recognition is currently active
 *   - transcript     — most recent recognized text (interim + final)
 *   - error          — user-friendly error string, or null
 *   - start()        — begin listening
 *   - stop()         — stop listening
 *   - resetError()   — clear the error state
 *
 * Does NOT record audio files. Does NOT use MediaRecorder.
 * The only output is a text transcript.
 */
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Map raw SpeechRecognition error codes to user-friendly messages.
 */
function friendlyError(errorEvent) {
  const code = errorEvent?.error || errorEvent?.message || "";
  switch (code) {
    case "not-allowed":
    case "permission-denied":
      return "Microphone permission was denied. Please allow microphone access or use text input instead.";
    case "no-speech":
      return "No speech was detected. Please try again or type your answer.";
    case "audio-capture":
      return "No microphone was found. Please check your device or type your answer.";
    case "network":
      return "A network error occurred with the speech service. Please try again or type your answer.";
    case "aborted":
      return null; // Intentional stop — not an error worth showing
    default:
      return "Voice input encountered an issue. Please try again or type your answer.";
  }
}

export default function useSpeechRecognition({ onTranscript, lang = "en-US" } = {}) {
  // ─── Browser support check ───────────────────────────────────────────────
  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  // ─── State ───────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  // ─── Refs ────────────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback ref fresh without re-creating the recognition instance
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // ─── Start ───────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!isSupported) {
      setError(
        "Voice input is not supported in this browser. Please type your answer instead."
      );
      return;
    }

    // Prevent duplicate sessions
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript("");

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      const combined = (finalText + interimText).trim();
      setTranscript(combined);

      // Notify parent with the latest transcript
      if (onTranscriptRef.current && combined) {
        onTranscriptRef.current(combined);
      }
    };

    recognition.onerror = (event) => {
      const msg = friendlyError(event);
      if (msg) {
        setError(msg);
      }
      // "no-speech" and "aborted" don't necessarily end the session
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("[useSpeechRecognition] start failed:", err);
      setError("Could not start voice input. Please try again or type your answer.");
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isSupported, SpeechRecognitionAPI, lang]);

  // ─── Stop ────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore — may already be stopped
      }
    }
    setIsListening(false);
  }, []);

  // ─── Reset error ─────────────────────────────────────────────────────────
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    start,
    stop,
    resetError,
  };
}
