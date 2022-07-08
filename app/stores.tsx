import { getBlock } from "@metablock/core";
import { createStores } from "@metablock/store";
import React from "react";

const block = getBlock();
const { commonStore, photoStore } = createStores(block.apiUrl, block.name);
export const storeContext = React.createContext({
  commonStore,
  photoStore,
});

export const useStores = () => React.useContext(storeContext);
