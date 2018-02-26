import { Record } from 'immutable';
import { Store } from '@memento/store';
import createMade, { set } from '@memento/made';

export class State extends Record({
  active: 'Todos',
}) {}

export const getActive = state => state.active;
export const setActive = name => () => set('active', name);

export default new Store(new State(), [createMade()]);
