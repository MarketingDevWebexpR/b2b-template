/**
 * useVoiceSearch Hook
 * Handles speech-to-text conversion for voice search functionality
 *
 * For Expo SDK 52, native speech recognition requires a development build.
 * This hook provides:
 * - Simulation mode for Expo Go development
 * - Optional expo-av integration for audio recording
 * - Ready for integration with speech-to-text APIs
 *
 * Required packages:
 * - expo-av (optional, for real audio recording)
 *
 * For production with real speech recognition, consider:
 * - @react-native-voice/voice (requires dev build)
 * - expo-speech (text-to-speech only)
 * - Google Cloud Speech-to-Text API
 * - AWS Transcribe
 * - Azure Speech Services
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Audio module interface for optional expo-av dependency
 */
interface AudioModule {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  setAudioModeAsync: (options: { allowsRecordingIOS: boolean; playsInSilentModeIOS: boolean }) => Promise<void>;
  Recording: {
    createAsync: (options: object) => Promise<{ recording: { stopAndUnloadAsync: () => Promise<void> } }>;
  };
}

// Conditionally import expo-av
let Audio: AudioModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-av').Audio as AudioModule;
} catch {
  console.log('expo-av not available, using simulation mode');
}

/**
 * Voice search states
 */
export type VoiceSearchState =
  | 'idle'           // Not recording
  | 'requesting'     // Requesting microphone permission
  | 'listening'      // Actively recording
  | 'processing'     // Processing speech to text
  | 'success'        // Successfully transcribed
  | 'error';         // Error occurred

/**
 * Error types for voice search
 */
export type VoiceSearchError =
  | 'permission_denied'      // Microphone permission denied
  | 'no_speech'              // No speech detected
  | 'network_error'          // Network/API error
  | 'not_available'          // Feature not available
  | 'cancelled'              // User cancelled
  | 'unknown';               // Unknown error

export interface VoiceSearchResult {
  /** The transcribed text */
  transcript: string;
  /** Confidence level (0-1) if available */
  confidence?: number;
  /** Whether the result is final or interim */
  isFinal: boolean;
}

export interface UseVoiceSearchOptions {
  /** Called when transcript is available */
  onTranscript?: (result: VoiceSearchResult) => void;
  /** Called when an error occurs */
  onError?: (error: VoiceSearchError, message: string) => void;
  /** Called when recording starts */
  onListeningStart?: () => void;
  /** Called when recording stops */
  onListeningEnd?: () => void;
  /** Maximum recording duration in ms (default: 10000) */
  maxDuration?: number;
  /** Language for recognition (default: 'fr-FR') */
  language?: string;
  /** Enable simulation mode for development (default: true in Expo Go) */
  simulationMode?: boolean;
}

export interface UseVoiceSearchReturn {
  /** Current state of voice search */
  state: VoiceSearchState;
  /** Current transcript text */
  transcript: string;
  /** Error type if state is 'error' */
  error: VoiceSearchError | null;
  /** Error message for display */
  errorMessage: string | null;
  /** Whether microphone permission is granted */
  hasPermission: boolean | null;
  /** Simulated audio level for visualization (0-1) */
  audioLevel: number;
  /** Start listening for voice input */
  startListening: () => Promise<void>;
  /** Stop listening and process */
  stopListening: () => Promise<void>;
  /** Cancel current operation */
  cancel: () => void;
  /** Reset to idle state */
  reset: () => void;
  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;
}

/**
 * French error messages
 */
const ERROR_MESSAGES: Record<VoiceSearchError, string> = {
  permission_denied: 'Accès au microphone refusé. Veuillez l\'autoriser dans les réglages.',
  no_speech: 'Aucune parole détectée. Veuillez réessayer.',
  network_error: 'Erreur de connexion. Vérifiez votre connexion internet.',
  not_available: 'La reconnaissance vocale n\'est pas disponible sur cet appareil.',
  cancelled: 'Recherche vocale annulée.',
  unknown: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
};

/**
 * Simulated French phrases for jewelry search (development mode)
 */
const SIMULATED_PHRASES = [
  'bague en or',
  'collier perles',
  'bracelet argent',
  'boucles d\'oreilles diamant',
  'pendentif coeur',
  'alliance or blanc',
  'solitaire',
  'jonc',
  'chaine en or',
  'montre luxe',
];

/**
 * Hook for voice search functionality
 */
export function useVoiceSearch(options: UseVoiceSearchOptions = {}): UseVoiceSearchReturn {
  const {
    onTranscript,
    onError,
    onListeningStart,
    onListeningEnd,
    maxDuration = 10000,
    language = 'fr-FR',
    simulationMode = true, // Default to simulation for Expo Go compatibility
  } = options;

  // State
  const [state, setState] = useState<VoiceSearchState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<VoiceSearchError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs
  const recordingRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  // Track state in ref to avoid stale closures
  const stateRef = useRef<VoiceSearchState>(state);
  stateRef.current = state;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  /**
   * Cleanup resources
   */
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
      simulationTimeoutRef.current = null;
    }
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    if (recordingRef.current && Audio) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
  }, []);

  /**
   * Set error state with message
   */
  const setErrorState = useCallback((errorType: VoiceSearchError) => {
    if (!isMountedRef.current) return;

    setError(errorType);
    setErrorMessage(ERROR_MESSAGES[errorType]);
    setState('error');

    // Haptic feedback for error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    onError?.(errorType, ERROR_MESSAGES[errorType]);
  }, [onError]);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState('requesting');

      // If expo-av is not available, assume permission is granted (simulation mode)
      if (!Audio) {
        if (isMountedRef.current) {
          setHasPermission(true);
          setState('idle');
        }
        return true;
      }

      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';

      if (isMountedRef.current) {
        setHasPermission(granted);
        setState('idle');
      }

      if (!granted) {
        setErrorState('permission_denied');
      }

      return granted;
    } catch (err) {
      // If permission check fails, allow simulation mode
      if (isMountedRef.current) {
        setHasPermission(true);
        setState('idle');
      }
      return true;
    }
  }, [setErrorState]);

  /**
   * Simulate audio level changes for visualization
   */
  const startAudioLevelSimulation = useCallback(() => {
    audioLevelIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        // Generate smooth random audio levels
        setAudioLevel(prev => {
          const target = Math.random() * 0.8 + 0.1;
          return prev + (target - prev) * 0.3;
        });
      }
    }, 100);
  }, []);

  /**
   * Stop audio level simulation
   */
  const stopAudioLevelSimulation = useCallback(() => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  /**
   * Simulate speech recognition (for development/Expo Go)
   */
  const simulateSpeechRecognition = useCallback(() => {
    // Store the current listening state to check later
    const listeningDuration = 1500 + Math.random() * 1000;

    simulationTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      // Check if we're still in listening state
      setState(currentState => {
        if (currentState !== 'listening') return currentState;
        return 'processing';
      });

      stopAudioLevelSimulation();

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isMountedRef.current) return;

      // 90% chance of success
      if (Math.random() > 0.1) {
        const phrase = SIMULATED_PHRASES[Math.floor(Math.random() * SIMULATED_PHRASES.length)];

        setTranscript(phrase);
        setState('success');

        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        onTranscript?.({
          transcript: phrase,
          confidence: 0.85 + Math.random() * 0.15,
          isFinal: true,
        });
      } else {
        setErrorState('no_speech');
      }
    }, listeningDuration);
  }, [stopAudioLevelSimulation, onTranscript, setErrorState]);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(async () => {
    try {
      // Reset state
      setTranscript('');
      setError(null);
      setErrorMessage(null);

      // Check permission
      if (hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) return;
      } else if (hasPermission === false) {
        setErrorState('permission_denied');
        return;
      }

      // Haptic feedback for start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setState('listening');
      startAudioLevelSimulation();
      onListeningStart?.();

      // Set timeout for max duration
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration);

      if (simulationMode || !Audio) {
        // Use simulation for Expo Go or when expo-av is not available
        simulateSpeechRecognition();
      } else {
        // Real implementation with expo-av
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          // Create recording using the Audio API
          const { recording } = await Audio.Recording.createAsync({});
          recordingRef.current = recording;

          // In a real implementation, you would:
          // 1. Stream audio to a speech-to-text API (Google, AWS, Azure)
          // 2. Or use native speech recognition via a dev build

          // For now, fall back to simulation
          simulateSpeechRecognition();
        } catch (recordError) {
          console.warn('Recording not available, using simulation:', recordError);
          simulateSpeechRecognition();
        }
      }
    } catch (err) {
      console.error('Error starting voice search:', err);
      setErrorState('unknown');
    }
  }, [
    hasPermission,
    requestPermission,
    maxDuration,
    simulationMode,
    startAudioLevelSimulation,
    simulateSpeechRecognition,
    onListeningStart,
    setErrorState,
  ]);

  /**
   * Stop listening and process the recording
   */
  const stopListening = useCallback(async () => {
    // Use ref to get current state and avoid stale closure
    if (stateRef.current !== 'listening') return;

    // Clear the simulation timeout to prevent state race
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
      simulationTimeoutRef.current = null;
    }

    cleanup();
    stopAudioLevelSimulation();
    onListeningEnd?.();

    if (recordingRef.current && Audio) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (err) {
        console.warn('Error stopping recording:', err);
      }
    }

    // Process what we have - check current state via ref
    if (stateRef.current === 'listening') {
      // If stopped manually without transcript, simulate quick processing
      setState('processing');
      await new Promise(resolve => setTimeout(resolve, 300));

      if (isMountedRef.current) {
        const phrase = SIMULATED_PHRASES[Math.floor(Math.random() * SIMULATED_PHRASES.length)];
        setTranscript(phrase);
        setState('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onTranscript?.({
          transcript: phrase,
          confidence: 0.85,
          isFinal: true,
        });
      }
    }
  }, [cleanup, stopAudioLevelSimulation, onListeningEnd, onTranscript]);

  /**
   * Cancel the current operation
   */
  const cancel = useCallback(() => {
    cleanup();
    stopAudioLevelSimulation();

    if (isMountedRef.current) {
      setState('idle');
      setTranscript('');
      setError(null);
      setErrorMessage(null);
    }

    onListeningEnd?.();
  }, [cleanup, stopAudioLevelSimulation, onListeningEnd]);

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    cleanup();
    stopAudioLevelSimulation();

    if (isMountedRef.current) {
      setState('idle');
      setTranscript('');
      setError(null);
      setErrorMessage(null);
    }
  }, [cleanup, stopAudioLevelSimulation]);

  return {
    state,
    transcript,
    error,
    errorMessage,
    hasPermission,
    audioLevel,
    startListening,
    stopListening,
    cancel,
    reset,
    requestPermission,
  };
}

export default useVoiceSearch;
