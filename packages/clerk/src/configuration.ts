import { Collection } from 'immutable';

export enum SaveMode {
  Auto = 'auto',
  Manual = 'manual',
  Interval = 'interval',
}

export enum LoadMode {
  Auto = 'auto',
  Manual = 'manual',
}

export enum Target {
  Local = 'local',
  Session = 'session',
}

export interface Reviver {
  (
    key: string | number,
    sequence: Collection.Keyed<string, any> | Collection.Indexed<any>,
    path?: Array<string | number>,
  ): any;
}

export interface Configuration {
  name: string;
  load?: LoadMode;
  save?: SaveMode;
  interval?: number;
  target?: Target;
  path?: string;
  reviver?: Reviver;
}
