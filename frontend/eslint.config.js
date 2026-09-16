import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        File: "readonly",
        FileReader: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        Headers: "readonly",
        alert: "readonly",
        confirm: "readonly",
        // Node globals
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        // Common globals
        Promise: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        React: "readonly",
        // Build stamp, substituted by vite.config.js `define`
        __APP_VERSION__: "readonly",
        __BUILD_TIME__: "readonly",
        __BUILD_COMMIT__: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "no-useless-constructor": 0,
      "react/prop-types": "off",
      "react/display-name": "off",
      "no-unused-vars": "off", // Changed from "warn" to "off"
      "no-undef": "warn",
      "no-control-regex": "warn",
      "no-empty": "warn",
      "no-dupe-keys": "warn",
      "no-redeclare": "warn",
      "no-useless-escape": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prettier/prettier": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "documentation/**",
      "*.min.js",
      "vite-plugin-license-header.js",
    ],
  },
];
