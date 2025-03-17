const text = (text: string, ownerDocument?: any) => {
  const doc = ownerDocument || document;
  return doc.createTextNode(text);
};

export default text;
