// src/eslint.ts
var baseEslintConfig = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
};
var reactEslintConfig = {
  ...baseEslintConfig,
  parserOptions: {
    ...baseEslintConfig.parserOptions,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [...baseEslintConfig.plugins, "react", "react-hooks"],
  extends: [
    ...baseEslintConfig.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    ...baseEslintConfig.rules,
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
};

export { baseEslintConfig, reactEslintConfig };
//# sourceMappingURL=eslint.js.map
//# sourceMappingURL=eslint.js.map