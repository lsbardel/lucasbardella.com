import React from "react";

const useFetch = (fetchData: () => Promise<any>) => {
  const [result, render] = React.useState();
  const tries = React.useRef(0);

  React.useEffect(() => {
    if (tries.current === 0) {
      tries.current += 1;
      fetchData().then((result) => render(result));
    }
  });
  return result;
};

export default useFetch;
