export const pathToArray = (path: string): (string | number)[] =>
  path
    .split('.')
    .map(segment => (/^[0-9]+$/.test(segment) ? parseInt(segment) : segment));

export const getStorageKey = name => `@memento/clerk/${name}`;
