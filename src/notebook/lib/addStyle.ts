const Styles = new Set<string>();

const addStyle = (style: string) => {
  if (Styles.has(style)) return;
  Styles.add(style);
  const link = document.createElement("style");
  link.innerHTML = style;
  document.head.appendChild(link);
};

export default addStyle;
