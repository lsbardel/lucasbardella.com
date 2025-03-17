export const ostring = Object.prototype.toString;
export const inBrowser =
  typeof window !== "undefined" && ostring.call(window) !== "[object Object]";
export const logger = inBrowser ? window.console : console;

export const identity = (v: any) => v;

export const asArray = (value: string | string[], split = ",") => {
  if (value.constructor === String) value = (value as string).split(split);
  if (value.constructor === Array)
    return value.map((v) => ("" + v).trim()).filter(identity);
  else return [];
};
