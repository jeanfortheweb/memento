import { State } from '@memento/store';
import { AjaxRequest } from '@reactivex/rxjs';
import { Record } from 'immutable';

export class AjaxRequestState extends Record<AjaxRequest>({
  async: true,
  body: null,
  crossDomain: true,
  withCredentials: false,
  method: 'GET',
  headers: {},
  password: '',
  user: '',
  url: '',
  responseType: 'application/json',
  timeout: 5000,
  createXHR: null as any,
}) {}

export interface Configuration<TState extends State> {
  baseURL: string;
  defaults: AjaxRequestState;
  _temp?: TState;
}

export class ConfigurationState extends Record<Configuration<any>>({
  baseURL: '',
  defaults: new AjaxRequestState({
    crossDomain: false,
  }),
}) {}
