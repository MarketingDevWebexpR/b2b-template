/**
 * Shared ESLint configuration
 */
/**
 * Base ESLint configuration for TypeScript projects
 */
declare const baseEslintConfig: {
    readonly parser: "@typescript-eslint/parser";
    readonly parserOptions: {
        readonly ecmaVersion: "latest";
        readonly sourceType: "module";
    };
    readonly plugins: readonly ["@typescript-eslint"];
    readonly extends: readonly ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-type-checked"];
    readonly rules: {
        readonly "@typescript-eslint/no-unused-vars": readonly ["error", {
            readonly argsIgnorePattern: "^_";
            readonly varsIgnorePattern: "^_";
        }];
        readonly "@typescript-eslint/consistent-type-imports": readonly ["error", {
            readonly prefer: "type-imports";
        }];
        readonly "@typescript-eslint/no-explicit-any": "error";
        readonly "@typescript-eslint/explicit-function-return-type": "off";
        readonly "@typescript-eslint/explicit-module-boundary-types": "off";
    };
};
/**
 * React-specific ESLint configuration
 */
declare const reactEslintConfig: {
    readonly parserOptions: {
        readonly ecmaFeatures: {
            readonly jsx: true;
        };
        readonly ecmaVersion: "latest";
        readonly sourceType: "module";
    };
    readonly plugins: readonly ["@typescript-eslint", "react", "react-hooks"];
    readonly extends: readonly ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-type-checked", "plugin:react/recommended", "plugin:react-hooks/recommended"];
    readonly settings: {
        readonly react: {
            readonly version: "detect";
        };
    };
    readonly rules: {
        readonly "react/react-in-jsx-scope": "off";
        readonly "react/prop-types": "off";
        readonly "@typescript-eslint/no-unused-vars": readonly ["error", {
            readonly argsIgnorePattern: "^_";
            readonly varsIgnorePattern: "^_";
        }];
        readonly "@typescript-eslint/consistent-type-imports": readonly ["error", {
            readonly prefer: "type-imports";
        }];
        readonly "@typescript-eslint/no-explicit-any": "error";
        readonly "@typescript-eslint/explicit-function-return-type": "off";
        readonly "@typescript-eslint/explicit-module-boundary-types": "off";
    };
    readonly parser: "@typescript-eslint/parser";
};

export { baseEslintConfig, reactEslintConfig };
