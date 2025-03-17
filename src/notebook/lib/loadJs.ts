const loadScript = (options: Record<string, any>, parent?: HTMLElement) => {
  return new Promise((resolve, reject) => {
    const { content, ...attrs } = options;
    const script = document.createElement("script");
    const attributes = attrs || {};
    Object.keys(attributes).forEach((key) => {
      script.setAttribute(key, attributes[key]);
    });
    if (content) script.innerHTML = JSON.stringify(content);
    script.onerror = reject;
    script.onload = resolve;
    (parent || document.head).appendChild(script);
  });
};

export default loadScript;
