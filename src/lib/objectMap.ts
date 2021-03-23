export const objectMap = (obj: any, mapFunction: (value: any) => any) => {
  if (!obj) return {};
  return Object.keys(obj).reduce((result, key) => {
    result[key] = mapFunction(obj[key]);
    return result;
  }, {} as any);
};
