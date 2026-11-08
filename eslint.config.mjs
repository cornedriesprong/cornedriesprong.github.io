import js from "@eslint/js";
import globals from "globals";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  {
    ignores: [
      ".astro/",
      ".husky/",
      ".vscode/",
      "node_modules/",
      "public/",
      "dist/",
    ],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
