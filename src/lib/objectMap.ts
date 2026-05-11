/**
 * Applies a function to each value of an object, similar to Array.prototype.map
 * @param obj the object whose values we'll apply the function
 * @param mapFunction the function to apply
 * @returns the new object
 */
export const objectMap = <T>(obj: unknown, mapFunction: (value: unknown) => T): Record<string, T> => {
  if (obj === null || typeof obj !== 'object') {
    return {};
  }
  return Object.keys(obj).reduce((result, key) => {
    (result as Record<string, unknown>)[key] = mapFunction((obj as Record<string, unknown>)[key]);
    return result;
  }, {});
};
