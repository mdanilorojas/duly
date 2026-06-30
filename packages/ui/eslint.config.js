import base from "@studio/eslint-config";

const NO_RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;

export default [
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${NO_RAW_COLOR.source}/]`,
          message: "Color crudo prohibido en ui — usá un token semantic.",
        },
      ],
    },
  },
];
