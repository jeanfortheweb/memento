import { AjaxRequest } from '@reactivex/rxjs';
import { Record } from 'immutable';

export interface Configuration extends AjaxRequest {}

export class ConfigurationState extends Record<AjaxRequest>({
  async: true,
  body: undefined,
  crossDomain: true,
  withCredentials: false,
  method: 'GET',
  headers: undefined,
  password: undefined,
  user: undefined,
  url: undefined,
  responseType: 'application/json',
  timeout: 5000,
  createXHR: undefined,
}) {}
