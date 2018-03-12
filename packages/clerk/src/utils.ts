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
  [P in keyof T]: SimpleReviver<T[P]> | GeneratedReviver<T[P]>
};

export type GeneratedReviver<T> = Reviver<T> & { _isReviver?: true };

export const createReviver = <T, R>(
  rootReviver: SimpleReviver<R>,
  struct?: ReviverStruct<Partial<T>>,
): GeneratedReviver<R> => {
  const map = struct ? fromJS(struct) : Map();

  const reviver: GeneratedReviver<R> = (key, sequence, path) => {
    if (path && path.length > 0) {
      const found = map.getIn(path);

      if (found) {
        if (found._isReviver) {
          return fromJS(sequence.toJS(), found);
        }

        return found(sequence);
      }

      return sequence;
    }

    return rootReviver(sequence);
  };

  reviver._isReviver = true;

  return reviver;
};
