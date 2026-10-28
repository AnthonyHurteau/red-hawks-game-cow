import tseslint from "@typescript-eslint/eslint-plugin";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default [
    { ignores: ["node_modules/**", ".aws-sam/**", "dist/**", ".prettierrc.js"] },
    ...tseslint.configs["flat/recommended"],
    prettierRecommended,
];
