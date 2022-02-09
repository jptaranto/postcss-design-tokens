const parser = require("postcss-value-parser")

/**
 * Parse a node to look for the token function.
 *
 * @param {object} node
 *   A node as returned by postcss-value-parser.
 *
 * @return {string|boolean}
 *   The parsed token name, or false if it's not a token() function
 */
module.exports = node => {
  if (node.type !== "function" || node.value !== "token") {
    return false
  }

  // Use the first arg only.
  const arg = node.nodes[0]

  // Allow arg in "string" or "word" format.
  if (!arg || (arg.type !== "string" && arg.type !== "word")) {
    throw `Incorrect or missing argument for token() function`
  }

  let token = parser.stringify(arg)

  // Remove quotes from string.
  if (arg.type === "string") {
    const search = new RegExp(arg.quote, "g")
    token = token.replace(search, "")
  }

  return token
}
