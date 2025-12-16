/**
 * Shared Prettier configuration
 */

import type { Options } from "prettier";

/**
 * Base Prettier configuration
 */
export const prettierConfig: Options = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
};

export default prettierConfig;
