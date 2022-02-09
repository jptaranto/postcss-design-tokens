const parseResult = require("./lib/parseResult")

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  const { tokens } = opts
  return {
    postcssPlugin: "postcss-design-tokens",
    Once(root, { result }) {
      if (!tokens || typeof tokens !== "object") {
        root.warn(
          result,
          `Design tokens must be passed through as a JS object via the "tokens" option in the plugin config`
        )
      }
    },
    Declaration: {
      "*": (decl, { result }) => {
        if (!decl.value) {
          return
        }
        try {
          decl.value = parseResult(decl.value, tokens)
        } catch (error) {
          decl.warn(result, error)
        }
      },
    },
    AtRule: {
      media: (atRule, { result }) => {
        if (!atRule.params.includes("token(")) {
          return
        }
        try {
          atRule.params = parseResult(atRule.params, tokens)
        } catch (error) {
          atRule.warn(result, error)
        }
      },
      "custom-media": (atRule, { result }) => {
        if (!atRule.params.includes("token(")) {
          return
        }
        try {
          atRule.params = parseResult(atRule.params, tokens)
        } catch (error) {
          atRule.warn(result, error)
        }
      },
    },
  }
}

module.exports.postcss = true
