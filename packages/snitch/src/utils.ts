export const match = (...args: any[]) => {
  const map = args.pop();
  const pattern = args
    .map(arg => typeof arg)
    .filter(arg => arg !== 'undefined')
    .join('|');

  if (map[pattern] !== undefined) {
    return map[pattern].apply(null, args);
  }

  throw new Error(`Invalid arguments, expected one of: ${Object.keys(map).join(', ')}`);
};
