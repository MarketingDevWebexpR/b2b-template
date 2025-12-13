/**
 * VoiceSearch Component
 * A premium modal overlay for voice input with animated microphone,
 * sound wave visualization, and real-time transcript display.
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Mic, X, Check, AlertCircle, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useVoiceSearch, VoiceSearchState } from '../../hooks/useVoiceSearch';
import { springConfigs } from '../../constants/animations';
import { COLORS } from '../../constants/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sound wave configuration
const WAVE_BAR_COUNT = 7;
const WAVE_BAR_MIN_HEIGHT = 8;
const WAVE_BAR_MAX_HEIGHT = 40;

interface VoiceSearchProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when user wants to close the modal */
  onClose: () => void;
  /** Called when a transcript is ready to be searched (alias: onResult) */
  onSearch?: (query: string) => void;
  /** Called when a transcript is ready to be searched (alias: onSearch) */
  onResult?: (query: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Individual sound wave bar component
 */
function WaveBar({
  index,
  audioLevel,
  isActive,
}: {
  index: number;
  audioLevel: number;
  isActive: boolean;
}) {
  const height = useSharedValue(WAVE_BAR_MIN_HEIGHT);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (isActive) {
      // Create varying heights based on audio level and bar position
      const centerOffset = Math.abs(index - Math.floor(WAVE_BAR_COUNT / 2));
      const heightMultiplier = 1 - centerOffset * 0.15;
      const targetHeight =
        WAVE_BAR_MIN_HEIGHT +
        (WAVE_BAR_MAX_HEIGHT - WAVE_BAR_MIN_HEIGHT) * audioLevel * heightMultiplier;

      height.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
      });
      opacity.value = withTiming(0.6 + audioLevel * 0.4, { duration: 100 });
    } else {
      height.value = withTiming(WAVE_BAR_MIN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [audioLevel, isActive, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.waveBar,
        animatedStyle,
        { backgroundColor: COLORS.hermes },
      ]}
    />
  );
}

/**
 * Animated spinner component for processing state
 */
function ProcessingSpinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinnerWrapper, animatedStyle]}>
      <Loader2 size={32} color={COLORS.white} strokeWidth={2} />
    </Animated.View>
  );
}

/**
 * Icon component based on voice search state
 */
function StateIcon({ state }: { state: VoiceSearchState }) {
  switch (state) {
    case 'processing':
      return <ProcessingSpinner />;
    case 'success':
      return <Check size={32} color={COLORS.white} strokeWidth={2.5} />;
    case 'error':
      return <AlertCircle size={32} color={COLORS.white} strokeWidth={2} />;
    default:
      return <Mic size={32} color={COLORS.white} strokeWidth={2} />;
  }
}

export function VoiceSearch({
  visible,
  onClose,
  onSearch,
  onResult,
  placeholder = 'Rechercher un bijou...',
}: VoiceSearchProps) {
  // Support both onSearch and onResult props for flexibility
  const handleSearchCallback = onSearch || onResult;
  // Voice search hook
  const {
    state,
    transcript,
    errorMessage,
    audioLevel,
    startListening,
    stopListening,
    cancel,
    reset,
  } = useVoiceSearch({
    onTranscript: (result) => {
      if (result.isFinal && result.transcript) {
        // Haptic feedback for success
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: () => {
      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onListeningStart: () => {
      // Light haptic when starting
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  const micScale = useSharedValue(1);
  const micGlow = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const transcriptOpacity = useSharedValue(0);
  const transcriptTranslateY = useSharedValue(10);

  /**
   * Show modal animation
   */
  const showModal = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: 300 });
    contentScale.value = withSpring(1, springConfigs.gentle);
    contentOpacity.value = withTiming(1, { duration: 250 });
  }, []);

  /**
   * Hide modal animation
   */
  const hideModal = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    contentScale.value = withTiming(0.9, { duration: 200 });
    contentOpacity.value = withTiming(0, { duration: 200 });

    // Reset states
    cancelAnimation(pulseScale);
    cancelAnimation(pulseOpacity);
    cancelAnimation(micGlow);
    reset();
  }, [reset]);

  // Start listening when modal opens
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (visible) {
      showModal();
      // Small delay before starting to listen
      timer = setTimeout(() => {
        startListening();
      }, 500);
    } else {
      hideModal();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [visible, showModal, hideModal, startListening]);

  // Handle state changes for animations
  useEffect(() => {
    if (state === 'listening') {
      // Start pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
      micGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else if (state === 'processing') {
      // Stop pulse, show loading state
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(micGlow);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
      micGlow.value = withTiming(0.5, { duration: 200 });
    } else if (state === 'success') {
      // Success animation
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(micGlow);
      micScale.value = withSequence(
        withSpring(1.2, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      );
      micGlow.value = withTiming(1, { duration: 200 });

      // Show transcript
      transcriptOpacity.value = withTiming(1, { duration: 300 });
      transcriptTranslateY.value = withSpring(0, springConfigs.gentle);
    } else if (state === 'error') {
      // Error animation
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(micGlow);
      pulseOpacity.value = withTiming(0, { duration: 200 });
      micScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, springConfigs.button)
      );
    } else {
      // Idle state
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(micGlow);
      pulseScale.value = 1;
      pulseOpacity.value = 0;
      micGlow.value = 0;
    }

    // Cleanup animations on unmount or state change
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      cancelAnimation(micGlow);
    };
  }, [state, pulseScale, pulseOpacity, micGlow, micScale, transcriptOpacity, transcriptTranslateY]);

  // Update transcript animation
  useEffect(() => {
    if (transcript) {
      transcriptOpacity.value = withTiming(1, { duration: 300 });
      transcriptTranslateY.value = withSpring(0, springConfigs.gentle);
    } else {
      transcriptOpacity.value = withTiming(0, { duration: 200 });
      transcriptTranslateY.value = 10;
    }
  }, [transcript]);

  /**
   * Handle close button press
   */
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancel();
    onClose();
  }, [cancel, onClose]);

  /**
   * Handle search/submit
   */
  const handleSubmit = useCallback(() => {
    if (transcript && handleSearchCallback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleSearchCallback(transcript);
      onClose();
    }
  }, [transcript, handleSearchCallback, onClose]);

  /**
   * Handle microphone button press
   */
  const handleMicPress = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle' || state === 'error' || state === 'success') {
      reset();
      startListening();
    }
  }, [state, startListening, stopListening, reset]);

  /**
   * Handle retry
   */
  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    setTimeout(() => startListening(), 300);
  }, [reset, startListening]);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const micContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const micGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(micGlow.value, [0, 1], [0, 0.5]),
  }));

  const transcriptStyle = useAnimatedStyle(() => ({
    opacity: transcriptOpacity.value,
    transform: [{ translateY: transcriptTranslateY.value }],
  }));

  // Get status text based on state
  const statusText = useMemo(() => {
    switch (state) {
      case 'requesting':
        return 'Demande d\'autorisation...';
      case 'listening':
        return 'Parlez maintenant...';
      case 'processing':
        return 'Traitement en cours...';
      case 'success':
        return 'Recherche vocale terminee';
      case 'error':
        return errorMessage || 'Une erreur est survenue';
      default:
        return 'Appuyez sur le micro pour parler';
    }
  }, [state, errorMessage]);

  // Get mic button color based on state
  const micButtonColor = useMemo(() => {
    switch (state) {
      case 'listening':
        return COLORS.hermes;
      case 'processing':
        return COLORS.stone;
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      default:
        return COLORS.hermes;
    }
  }, [state]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* Close button */}
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={20}
          accessibilityLabel="Fermer"
          accessibilityRole="button"
        >
          <X size={24} color={COLORS.white} strokeWidth={2} />
        </Pressable>

        {/* Main content */}
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Card */}
          <View style={styles.card}>
            {/* Title */}
            <Text style={styles.title}>Recherche vocale</Text>

            {/* Status text */}
            <Text
              style={[
                styles.statusText,
                state === 'error' && styles.statusTextError,
                state === 'success' && styles.statusTextSuccess,
              ]}
            >
              {statusText}
            </Text>

            {/* Microphone button with pulse animation */}
            <View style={styles.micSection}>
              {/* Pulse rings */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  pulseStyle,
                  { backgroundColor: micButtonColor },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRingInner,
                  pulseStyle,
                  { backgroundColor: micButtonColor },
                ]}
              />

              {/* Mic button */}
              <AnimatedPressable
                style={[styles.micButton, micContainerStyle]}
                onPress={handleMicPress}
                accessibilityLabel={state === 'listening' ? 'Arreter l\'ecoute' : 'Commencer l\'ecoute'}
                accessibilityRole="button"
                accessibilityState={{ selected: state === 'listening' }}
              >
                {/* Glow */}
                <Animated.View
                  style={[
                    styles.micGlow,
                    micGlowStyle,
                    { backgroundColor: micButtonColor },
                  ]}
                />

                {/* Button background */}
                <View style={[styles.micButtonInner, { backgroundColor: micButtonColor }]}>
                  <StateIcon state={state} />
                </View>
              </AnimatedPressable>
            </View>

            {/* Sound wave visualization */}
            <View style={styles.waveContainer}>
              {Array.from({ length: WAVE_BAR_COUNT }).map((_, index) => (
                <WaveBar
                  key={index}
                  index={index}
                  audioLevel={audioLevel}
                  isActive={state === 'listening'}
                />
              ))}
            </View>

            {/* Transcript display */}
            {(transcript || state === 'success') && (
              <Animated.View style={[styles.transcriptContainer, transcriptStyle]}>
                <Text style={styles.transcriptLabel}>Votre recherche :</Text>
                <Text style={styles.transcriptText}>
                  {transcript || placeholder}
                </Text>
              </Animated.View>
            )}

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {state === 'error' && (
                <Pressable
                  style={[styles.button, styles.retryButton]}
                  onPress={handleRetry}
                  accessibilityLabel="Reessayer"
                  accessibilityRole="button"
                >
                  <Text style={styles.retryButtonText}>Reessayer</Text>
                </Pressable>
              )}

              {state === 'success' && transcript && (
                <Pressable
                  style={[styles.button, styles.searchButton]}
                  onPress={handleSubmit}
                  accessibilityLabel="Rechercher"
                  accessibilityRole="button"
                >
                  <Text style={styles.searchButtonText}>Rechercher</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                accessibilityLabel="Annuler"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  content: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
  },

  card: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },

  title: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
  },

  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.stone,
    textAlign: 'center',
    marginBottom: 32,
  },

  statusTextError: {
    color: COLORS.error,
  },

  statusTextSuccess: {
    color: COLORS.success,
  },

  micSection: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  pulseRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  micGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  micButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  spinnerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 6,
    marginBottom: 24,
  },

  waveBar: {
    width: 4,
    borderRadius: 2,
  },

  transcriptContainer: {
    width: '100%',
    backgroundColor: COLORS.hermesLightAlpha,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  transcriptLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.hermesDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  transcriptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.charcoal,
  },

  buttonContainer: {
    width: '100%',
    gap: 12,
  },

  button: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchButton: {
    backgroundColor: COLORS.hermes,
  },

  searchButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  retryButton: {
    backgroundColor: COLORS.charcoal,
  },

  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.stone,
    letterSpacing: 0.3,
  },
});

export default VoiceSearch;
