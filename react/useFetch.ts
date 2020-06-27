import React from "react";

const useFetch = (fetchData: () => Promise<any>, key?: any) => {
  const [data, render] = React.useState();
  const target = React.useRef(key);
  const tries = React.useRef(0);
  let result = data;

  if (target.current !== key) {
    target.current = key;
    tries.current = 0;
    result = undefined;
  }

  React.useEffect(() => {
    if (tries.current === 0) {
      tries.current += 1;
      fetchData().then((d) => render(d));
    }
  });
  return result;
};

export default useFetch;
