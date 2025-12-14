/**
 * SearchBar Component
 * A luxury animated search bar with voice and camera icons
 * Features smooth animations, haptic feedback, and elegant typography
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Search, Mic, Camera, X } from 'lucide-react-native';
import { springConfigs, timingConfigs, durations } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  taupe: '#d4c9bd',
  stone: '#b8a99a',
  sand: '#f0ebe3',
  white: '#ffffff',
  muted: '#696969',
};

// Animated placeholder texts
const PLACEHOLDER_TEXTS = [
  'Bagues en or...',
  'Colliers diamant...',
  'Bracelets argent...',
  'Boucles d\'oreilles...',
  'Montres de luxe...',
];

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onVoicePress?: () => void;
  onCameraPress?: () => void;
  isFocused?: boolean;
  autoFocus?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function SearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onSubmit,
  onVoicePress,
  onCameraPress,
  isFocused = false,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Animation values
  const focusProgress = useSharedValue(0);
  const searchIconScale = useSharedValue(1);
  const clearButtonOpacity = useSharedValue(0);
  const placeholderOpacity = useSharedValue(1);
  const voiceButtonScale = useSharedValue(1);
  const cameraButtonScale = useSharedValue(1);
  const containerBorderColor = useSharedValue(0);

  // Handle focus state
  useEffect(() => {
    if (isFocused) {
      focusProgress.value = withSpring(1, springConfigs.gentle);
      containerBorderColor.value = withTiming(1, timingConfigs.standard);
      searchIconScale.value = withSequence(
        withSpring(0.8, springConfigs.snap),
        withSpring(1, springConfigs.button)
      );
    } else {
      focusProgress.value = withSpring(0, springConfigs.gentle);
      containerBorderColor.value = withTiming(0, timingConfigs.standard);
    }
  }, [isFocused, focusProgress, containerBorderColor, searchIconScale]);

  // Handle clear button visibility
  useEffect(() => {
    if (value.length > 0) {
      clearButtonOpacity.value = withTiming(1, timingConfigs.micro);
    } else {
      clearButtonOpacity.value = withTiming(0, timingConfigs.micro);
    }
  }, [value, clearButtonOpacity]);

  // Animate placeholder text cycling
  useEffect(() => {
    if (!isFocused && value.length === 0) {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const interval = setInterval(() => {
        placeholderOpacity.value = withSequence(
          withTiming(0, { duration: durations.fast }),
          withTiming(1, { duration: durations.fast })
        );
        timeoutId = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        }, durations.fast);
      }, 3000);
      return () => {
        clearInterval(interval);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [isFocused, value, placeholderOpacity]);

  // Handle text clearing
  const handleClear = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onChangeText('');
    inputRef.current?.focus();
  }, [onChangeText]);

  // Button press handlers
  const handleVoicePressIn = useCallback(() => {
    voiceButtonScale.value = withSpring(0.85, springConfigs.button);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [voiceButtonScale]);

  const handleVoicePressOut = useCallback(() => {
    voiceButtonScale.value = withSpring(1, springConfigs.button);
  }, [voiceButtonScale]);

  const handleVoicePress = useCallback(() => {
    // Dismiss keyboard before opening voice search
    Keyboard.dismiss();
    onVoicePress?.();
  }, [onVoicePress]);

  const handleCameraPressIn = useCallback(() => {
    cameraButtonScale.value = withSpring(0.85, springConfigs.button);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [cameraButtonScale]);

  const handleCameraPressOut = useCallback(() => {
    cameraButtonScale.value = withSpring(1, springConfigs.button);
  }, [cameraButtonScale]);

  const handleCameraPress = useCallback(() => {
    // Dismiss keyboard before opening camera
    Keyboard.dismiss();
    onCameraPress?.();
  }, [onCameraPress]);

  const handleFocus = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const handleSubmit = useCallback(() => {
    debouncedHaptic(hapticFeedback.addToCartPress);
    Keyboard.dismiss();
    onSubmit?.();
  }, [onSubmit]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolate(
      containerBorderColor.value,
      [0, 1],
      [0, 1]
    );
    return {
      borderColor: borderColor === 1 ? COLORS.hermes : COLORS.taupe,
      shadowOpacity: interpolate(focusProgress.value, [0, 1], [0.05, 0.12]),
      transform: [
        {
          scale: interpolate(
            focusProgress.value,
            [0, 1],
            [1, 1.02],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const searchIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchIconScale.value }],
    opacity: interpolate(focusProgress.value, [0, 1], [0.6, 1]),
  }));

  const clearButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: clearButtonOpacity.value,
    transform: [
      {
        scale: interpolate(clearButtonOpacity.value, [0, 1], [0.5, 1]),
      },
    ],
  }));

  const voiceButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voiceButtonScale.value }],
    opacity: interpolate(
      clearButtonOpacity.value,
      [0, 0.5, 1],
      [1, 0.5, 0]
    ),
  }));

  const cameraButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraButtonScale.value }],
  }));

  const placeholderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: placeholderOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, containerAnimatedStyle]}
      entering={FadeIn.duration(durations.normal)}
    >
      {/* Glass effect background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.solidBackground} />
      </View>

      <View style={styles.content}>
        {/* Search Icon */}
        <Animated.View style={[styles.searchIcon, searchIconAnimatedStyle]}>
          <Search
            size={20}
            color={isFocused ? COLORS.hermes : COLORS.stone}
            strokeWidth={2}
          />
        </Animated.View>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            placeholder=""
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            autoFocus={autoFocus}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={COLORS.hermes}
            accessibilityLabel="Champ de recherche"
            accessibilityHint="Rechercher des bijoux"
          />

          {/* Animated Placeholder */}
          {value.length === 0 && (
            <Animated.View
              style={[styles.placeholderContainer, placeholderAnimatedStyle]}
              pointerEvents="none"
            >
              <Animated.Text style={styles.placeholder}>
                {PLACEHOLDER_TEXTS[placeholderIndex]}
              </Animated.Text>
            </Animated.View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Clear Button */}
          <AnimatedPressable
            style={[styles.actionButton, clearButtonAnimatedStyle]}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Effacer la recherche"
            accessibilityRole="button"
          >
            <View style={styles.clearButtonInner}>
              <X size={14} color={COLORS.white} strokeWidth={2.5} />
            </View>
          </AnimatedPressable>

          {/* Voice Search Button */}
          {value.length === 0 && (
            <AnimatedPressable
              style={[styles.actionButton, voiceButtonAnimatedStyle]}
              onPressIn={handleVoicePressIn}
              onPressOut={handleVoicePressOut}
              onPress={handleVoicePress}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              accessibilityLabel="Recherche vocale"
              accessibilityRole="button"
            >
              <Mic size={20} color={COLORS.stone} strokeWidth={1.8} />
            </AnimatedPressable>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Camera/Barcode Button */}
          <AnimatedPressable
            style={[styles.actionButton, cameraButtonAnimatedStyle]}
            onPressIn={handleCameraPressIn}
            onPressOut={handleCameraPressOut}
            onPress={handleCameraPress}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 10 }}
            accessibilityLabel="Scanner un code-barres"
            accessibilityRole="button"
          >
            <Camera size={20} color={COLORS.stone} strokeWidth={1.8} />
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  solidBackground: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  searchIcon: {
    marginRight: 12,
  },

  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 24,
  },

  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.charcoal,
    paddingVertical: 0,
    ...Platform.select({
      ios: {},
      android: {
        paddingVertical: 0,
        marginVertical: -4,
      },
    }),
  },

  placeholderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },

  placeholder: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.muted,
    fontStyle: 'italic',
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  actionButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.stone,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.sand,
    marginHorizontal: 8,
  },
});

export default SearchBar;
