const LoadedModules: Record<string, Promise<void>> = {};

const loadJsModule = async (src: string): Promise<any> => {
  if (!LoadedModules[src]) {
    LoadedModules[src] = await import(/* webpackIgnore: true */ src);
  }
  return LoadedModules[src];
};

export default loadJsModule;
