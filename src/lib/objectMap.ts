/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Applies a function to each value of an object, similar to Array.prototype.map
 * @param obj the object whose values we'll apply the function
 * @param mapFunction the function to apply
 * @returns the new object
 */
export const objectMap = (obj: any, mapFunction: (value: unknown) => unknown): any => {
  if (!obj) { return {}; }
  return Object.keys(obj).reduce<any>((result, key) => {
    result[key] = mapFunction(obj[key]);
    return result;
  }, {});
};
