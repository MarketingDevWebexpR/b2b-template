import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname } from "path";

/**
 * Resolve the absolute path of a package.
 * Used to resolve the path of storybook addons.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  // Story file locations - searches in ui and ui-b2b packages
  stories: [
    "../packages/ui/src/**/*.mdx",
    "../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../packages/ui-b2b/src/**/*.mdx",
    "../packages/ui-b2b/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  // Storybook addons
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-a11y"),
  ],

  // Framework configuration
  framework: {
    name: getAbsolutePath("@storybook/react-vite") as "@storybook/react-vite",
    options: {},
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent
          ? !/node_modules\/(?!@maison)/.test(prop.parent.fileName)
          : true,
    },
  },

  // Vite configuration overrides
  viteFinal: async (config) => {
    // Add path aliases for monorepo packages
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@maison/ui": join(__dirname, "../packages/ui/src"),
      "@maison/ui-b2b": join(__dirname, "../packages/ui-b2b/src"),
      "@maison/types": join(__dirname, "../packages/types/src"),
      "@maison/utils": join(__dirname, "../packages/utils/src"),
      "@maison/hooks": join(__dirname, "../packages/hooks/src"),
    };

    return config;
  },

  // Documentation features
  docs: {
    autodocs: "tag",
  },

  // Static files directory
  staticDirs: ["./public"],
};

export default config;
