import type { Config } from 'tailwindcss';
import { baseConfig } from './base';

/**
 * NativeWind-specific Tailwind configuration
 * Optimized for React Native compatibility
 */
export const nativeConfig: Config = {
  content: [], // Will be set by consuming app
  presets: [baseConfig as Config],
  theme: {
    extend: {
      // NativeWind-compatible spacing (uses density-independent pixels)
      // Shadows work differently in RN - use elevation or shadow props
    },
  },
  plugins: [],
};

export default nativeConfig;
