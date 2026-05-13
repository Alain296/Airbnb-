/**
 * Helper to ensure param is a string (not an array)
 * Express params can be string | string[] but we always expect single values
 */
export const getParamAsString = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};
