import asciiToArray from './asciiToArray';
import hasUnicode from './hasUnicode';
import unicodeToArray from './unicodeToArray';

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
export default function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
