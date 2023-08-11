/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.eslint.json",
      "./api/tsconfig.json",
      "./web/tsconfig.json",
    ],
  },
  root: true,
  ignorePatterns: [".eslintrc.cjs"],
};
