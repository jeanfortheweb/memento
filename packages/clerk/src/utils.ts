import { Collection, fromJS, Map } from 'immutable';
import { Reviver } from './configuration';

export const pathToArray = (path: string): (string | number)[] =>
  path
    .split('.')
    .map(segment => (/^[0-9]+$/.test(segment) ? parseInt(segment) : segment));

export const getStorageKey = name => `@memento/clerk/${name}`;

export type SimpleReviver<T> = {
  (sequence: Collection.Keyed<string, any> | Collection.Indexed<any>): T;
};

export type ReviverStruct<T> = {
  [P in keyof T]: SimpleReviver<T[P]> | ReviverStruct<T[P]>
};

export const createReviver = <T, R>(
  rootReviver: SimpleReviver<R>,
  struct?: ReviverStruct<Partial<T>>,
): Reviver<R> => {
  const map = struct ? fromJS(struct) : Map();

  return (key, sequence, path) => {
    if (path && path.length > 0) {
      const reviver = map.getIn(path);

      if (reviver) {
        return reviver(sequence);
      }

      return sequence;
    }

    return rootReviver(sequence);
  };
};
