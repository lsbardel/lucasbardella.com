const compileOptions = (text: string): Record<string, any> => {
  return text
    .split("\n")
    .filter((text) => text.length > 0)
    .reduce((headers: Record<string, any>, header: string) => {
      const [key, value] = compileOption(header);
      if (key in headers) {
        if (headers[key].constructor !== Array) headers[key] = [headers[key]];
        headers[key].push(value);
      } else headers[key] = value;
      return headers;
    }, {});
};

const compileOption = (text: string): string[] => {
  const bits = text.split(":");
  const name = bits[0].trim();
  if (!name || bits.length < 2) throw new Error(`Bad header ${text}`);
  let value = bits.slice(1).join(":").trim();
  try {
    value = JSON.parse(value);
  } catch (err) {
    // skip on error
  }
  return [name, value];
};

export default compileOptions;
