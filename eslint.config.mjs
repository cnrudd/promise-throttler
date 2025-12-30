import { defineConfig } from "eslint/config";
import globals from "globals";
import jsdoc from 'eslint-plugin-jsdoc';

export default defineConfig([
    {
        ignores: ["dist/**"]
    },
    // configuration included in plugin
    jsdoc.configs['flat/recommended'],
    {
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    plugins: {
        jsdoc
    },

    rules: {
        "brace-style": [2, "1tbs"],
        "comma-style": [2, "last"],
        camelcase: 2,
        curly: 2,
        "default-case": 2,
        eqeqeq: 2,
        "guard-for-in": 2,
        indent: [2, 2],

        "keyword-spacing": ["error", {
            before: true,
        }],

        "new-cap": 0,
        "no-console": 0,
        "no-debugger": 2,
        "no-empty": 2,
        "no-floating-decimal": 2,
        "no-nested-ternary": 2,
        "no-undefined": 2,
        "no-underscore-dangle": 0,
        "no-unreachable": 2,
        radix: 2,
        quotes: [2, "single"],
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        "space-before-blocks": 2,

        "spaced-comment": [2, "always", {
            exceptions: ["-"],
        }],

        "jsdoc/check-access": "warn",
        "jsdoc/check-alignment": "warn",
        "jsdoc/check-indentation": "warn",
        "jsdoc/check-param-names": "warn",
        "jsdoc/check-tag-names": "warn",
        "jsdoc/check-types": "warn",

        "wrap-iife": [2, "any"],
    },
}]);