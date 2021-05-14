/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
export const objectMap = (obj: any, mapFunction: (value: unknown) => unknown): any => {
  if (!obj) { return {}; }
  return Object.keys(obj).reduce<any>((result, key) => {
    result[key] = mapFunction(obj[key]);
    return result;
  }, {});
};
