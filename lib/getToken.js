/**
 * Retrieve the token value from the tokens object.
 *
 * @param {string} token
 *   The token name, using dot notation for nested values. Some examples:
 *     blue
 *     colors.blue
 *     colors.brand.blue
 * @param {object} tokens
 *   The object of tokens to search within.
 *
 * @return {string|undefined}
 *   The token value or undefined if it wasn't found.
 */
module.exports = (token, tokens) => {
  // Attempt to get the token value by splitting the string.
  let value
  try {
    value = token.split(".").reduce((o, i) => o[i], tokens)
  } catch (error) {
    value = null
  }
  if (!value) {
    throw `Could not find the ${token} token`
  }
  return value
}
