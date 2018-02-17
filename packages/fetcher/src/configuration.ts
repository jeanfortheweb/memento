import { State } from '@memento/store';
import { AjaxRequest } from '@reactivex/rxjs';
import { Record } from 'immutable';

export interface Configuration<TState extends State> {
  baseURL: string;
  defaults: Partial<AjaxRequest>;
  _temp?: TState;
}

export class ConfigurationState extends Record<Configuration<any>>({
  baseURL: '',
  defaults: {},
}) {}
