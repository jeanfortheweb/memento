import { Record, List } from 'immutable';
import { Updater, State as StoreState, Task } from '@memento/store';

export default interface History<TState extends StoreState> {
  state: List<TState>;
  task: List<Task>;
  output: List<Task | Updater<TState>>;
};

export class State extends Record<History<any>>({
  state: List(),
  task: List(),
  output: List(),
}) {}
