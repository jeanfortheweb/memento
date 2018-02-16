import { Observable, withLatestFrom, flatMap } from '@reactivex/rxjs';
import { Store } from '@memento/store';
import createMade, { set } from '@memento/made';

import { Record, List } from 'immutable';
import shortid from 'shortid';

export class State extends Record({
  filter: 'ALL',
}) {}

// task creators
export const setFilter = value => () => set('filter', value.toUpperCase());

// selectors
export const getFilter = state => state.filter;

export default new Store(new State(), [createMade()]);
