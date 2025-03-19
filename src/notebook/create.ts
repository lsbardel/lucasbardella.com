//import installElements from "./components";
import Notebook from "./notebook";

const createNotebook = (mode?: string): Notebook => {
  const notebook = new Notebook();
  if (mode) {
    notebook.options.mode = mode;
  }
  return notebook;
};

export default createNotebook;
