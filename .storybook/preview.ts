import type { Preview } from "@storybook/react";
import React from "react";

/**
 * Global decorators applied to all stories.
 * Decorators wrap each story and can provide context, styling, or other functionality.
 */
const decorators: Preview["decorators"] = [
  // Theme wrapper decorator
  (Story, context) => {
    const theme = context.globals.theme || "light";
    return React.createElement(
      "div",
      {
        className: theme === "dark" ? "dark" : "",
        style: {
          padding: "1rem",
          minHeight: "100vh",
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#1a1a1a",
        },
      },
      React.createElement(Story)
    );
  },
];

/**
 * Global parameters for all stories.
 */
const parameters: Preview["parameters"] = {
  // Actions configuration
  actions: {
    argTypesRegex: "^on[A-Z].*",
  },

  // Controls configuration
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
    sort: "requiredFirst",
  },

  // Backgrounds configuration
  backgrounds: {
    default: "light",
    values: [
      {
        name: "light",
        value: "#ffffff",
      },
      {
        name: "dark",
        value: "#1a1a1a",
      },
      {
        name: "gray",
        value: "#f5f5f5",
      },
    ],
  },

  // Viewport configuration for responsive testing
  viewport: {
    viewports: {
      mobile: {
        name: "Mobile",
        styles: {
          width: "375px",
          height: "667px",
        },
      },
      tablet: {
        name: "Tablet",
        styles: {
          width: "768px",
          height: "1024px",
        },
      },
      desktop: {
        name: "Desktop",
        styles: {
          width: "1280px",
          height: "800px",
        },
      },
      wide: {
        name: "Wide Desktop",
        styles: {
          width: "1920px",
          height: "1080px",
        },
      },
    },
  },

  // Layout configuration
  layout: "centered",

  // Documentation configuration
  docs: {
    toc: true,
  },

  // Options for the Storybook UI
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Introduction",
        "Design System",
        ["Colors", "Typography", "Spacing", "Icons"],
        "Components",
        ["Atoms", "Molecules", "Organisms", "Templates"],
        "B2B Components",
        "Hooks",
        "Utils",
        "*",
      ],
    },
  },
};

/**
 * Global types for toolbar controls.
 */
const globalTypes: Preview["globalTypes"] = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    defaultValue: "light",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    defaultValue: "fr",
    toolbar: {
      icon: "globe",
      items: [
        { value: "fr", title: "Francais", right: "FR" },
        { value: "en", title: "English", right: "EN" },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

/**
 * Preview configuration export.
 */
const preview: Preview = {
  decorators,
  parameters,
  globalTypes,
  tags: ["autodocs"],
};

export default preview;
