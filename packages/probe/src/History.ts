import { Record, List } from 'immutable';
import { Updater, State, Task } from '@memento/store';

export interface History<TState extends State> {
  state: List<TState>;
  task: List<Task>;
  output: List<Task | Updater<TState>>;
}

export default class HistoryState extends Record<History<any>>({
  state: List(),
  task: List(),
  output: List(),
}) {}
