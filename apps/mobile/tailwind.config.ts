import type { Config } from 'tailwindcss';
import { baseConfig } from '@bijoux/config-tailwind/base';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
    },
  },
  plugins: [],
};

export default config;
