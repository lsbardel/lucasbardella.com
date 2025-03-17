let count = 0;

const uid = (name: string): string => {
  count++;
  return `O-${name}-${count}`;
};


export default uid;
