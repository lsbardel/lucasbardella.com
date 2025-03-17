import Notebook from "../notebook";

const after = async (
  notebook: Notebook,
  root: any,
  options: any
): Promise<void> => {
  const elements = root.querySelectorAll("pre code[class]");
  if (elements.length > 0) {
    await Promise.all(
      Array.from(elements, async (element: Element) => {
        await notebook.renderCode(element);
      })
    );
  }
};

export default { after };
