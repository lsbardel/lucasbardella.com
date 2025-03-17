const ScriptPromises: Record<string, Promise<void>> = {};

const attachScript = (script: any) => {
  const text = script.textContent;
  if (!ScriptPromises[text]) {
    ScriptPromises[text] = new Promise((resolve, reject) => {
      document.head.appendChild(script);
      resolve();
    });
  }
  return ScriptPromises[text];
};

export default attachScript;
