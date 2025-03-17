//import installElements from "./components";
import Notebook from "./notebook";

const createNotebook = (mode?: string): Notebook => {
  // @ts-ignore
  if (!window.notebook) {
    // @ts-ignore
    window.notebook = new Notebook();
    // installElements();
  }
  if (mode) {
    // @ts-ignore
    window.notebook.options.mode = mode;
  }
  // @ts-ignore
  return window.notebook;
};

export default createNotebook;
