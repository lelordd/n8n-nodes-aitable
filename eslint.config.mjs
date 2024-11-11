import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPlugin from "@typescript-eslint/eslint-plugin"; // Thay đổi ở đây
import parser from "@typescript-eslint/parser"; // Thay đổi ở đây

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  eslintPlugin.configs.recommended, // Sử dụng eslintPlugin ở đây
  { parser }, // Sử dụng parser ở đây
];
