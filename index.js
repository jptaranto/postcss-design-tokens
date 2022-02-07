const parser = require("postcss-value-parser")

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
    Declaration(decl, { result }) {
      if (!decl.value) return
      try {
        decl.value = parser(decl.value)
          .walk(node => {
            // Ensure this is a token() function.
            if (node.type !== "function" || node.value !== "token") {
              return
            }
            // Use the first arg.
            const arg = node.nodes[0]
            if (!arg || arg.type !== "word") {
              throw `Incorrect or missing argument for token() function`
            }

            const token = parser.stringify(arg)
            const value = token.split(".").reduce((o, i) => o[i], tokens)

            // Error out of the try/catch if the token isn't available.
            if (!value) {
              throw `Could not find the ${token} token`
            }

            node.type = "word"
            node.value = value
          })
          .toString()
      } catch (error) {
        decl.warn(result, error)
      }
    },
  }
}

module.exports.postcss = true
