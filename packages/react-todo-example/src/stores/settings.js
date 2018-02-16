import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Store } from '@memento/store';
import { createStoreWorker, merge } from '@memento/common';
import { Record, List } from 'immutable';
import shortid from 'shortid';

export class State extends Record({
  filter: 'ALL',
}) {}

// task creators
export const setFilter = value => () => merge({ filter: value.toUpperCase() });

// selectors
export const getFilter = state => state.filter;

export default new Store(new State(), [createStoreWorker()]);
