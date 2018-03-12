import { Collection, fromJS } from 'immutable';

export interface Reviver<T = any> {
  (
    key: string | number,
    sequence: Collection.Keyed<string, any> | Collection.Indexed<any>,
    path?: Array<string | number>,
  ): T;
}

export type SimpleReviver<T> = {
  (sequence: Collection.Keyed<string, any> | Collection.Indexed<any>): T;
};

export type ReviverStruct<T> = {
  [P in keyof T]?: SimpleReviver<T[P]> | CreatedReviver<T[P]>
};

export type CreatedReviver<T> = Reviver<T> & { _isReviver?: true };

const isCreatedReviver = (
  input: SimpleReviver<any> | CreatedReviver<any>,
): input is CreatedReviver<any> => (input as any)._isReviver === true;

const revive = (
  sequence: Collection.Keyed<string, any> | Collection.Indexed<any>,
  reviver?: SimpleReviver<any> | CreatedReviver<any>,
) => {
  if (reviver) {
    if (isCreatedReviver(reviver)) {
      return fromJS(sequence.toJS(), reviver);
    }

    return reviver(sequence);
  }

  return sequence;
};

export const create = <T, R>(
  root: SimpleReviver<R>,
  children: ReviverStruct<T> = {},
): CreatedReviver<R> => {
  const reviver: CreatedReviver<R> = (key, sequence, path) => {
    if (key !== '') {
      return revive(sequence, children[key]);
    }

    return root(sequence);
  };

  reviver._isReviver = true;

  return reviver;
};

export default create;
