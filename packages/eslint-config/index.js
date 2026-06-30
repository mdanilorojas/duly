// Bloquea hex/rgba crudo en código de componentes (deben ser tokens).
const NO_RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: `Literal[value=/${NO_RAW_COLOR.source}/]`,
        message: "Color crudo prohibido en ui — usá un token semantic.",
      },
    ],
  },
};
