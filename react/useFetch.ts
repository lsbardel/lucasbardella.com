import React from "react";

const useFetch = (fetchData: () => Promise<any>, key?: any) => {
  const [result, render] = React.useState();
  const target = React.useRef(key);
  const tries = React.useRef(0);

  if (target.current !== key) {
    target.current = key;
    tries.current = 0;
  }

  React.useEffect(() => {
    if (tries.current === 0) {
      tries.current += 1;
      fetchData().then((result) => render(result));
    }
  });
  return result;
};

export default useFetch;
