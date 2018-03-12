import { Collection, fromJS } from 'immutable';
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
  [P in keyof T]?: SimpleReviver<T[P]> | GeneratedReviver<T[P]>
};

export type GeneratedReviver<T> = Reviver<T> & { _isReviver?: true };

const isGeneratedReviver = (
  input: SimpleReviver<any> | GeneratedReviver<any>,
): input is GeneratedReviver<any> => (input as any)._isReviver === true;

const revive = (
  sequence: Collection.Keyed<string, any> | Collection.Indexed<any>,
  reviver?: SimpleReviver<any> | GeneratedReviver<any>,
) => {
  if (reviver) {
    if (isGeneratedReviver(reviver)) {
      return fromJS(sequence.toJS(), reviver);
    }

    return reviver(sequence);
  }

  return sequence;
};

export const createReviver = <T, R>(
  rootReviver: SimpleReviver<R>,
  struct: ReviverStruct<T> = {},
): GeneratedReviver<R> => {
  const reviver: GeneratedReviver<R> = (key, sequence, path) => {
    if (key !== '') {
      return revive(sequence, struct[key]);
    }

    return rootReviver(sequence);
  };

  reviver._isReviver = true;

  return reviver;
};
