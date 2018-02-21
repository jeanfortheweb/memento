import { Record, List } from 'immutable';
import { Updater, State, Task } from '@memento/store';

export interface ProbeHistory<TState extends State> {
  state: List<TState>;
  task: List<Task>;
  output: List<Task | Updater<TState>>;
}

export default class ProbeHistoryState extends Record<ProbeHistory<any>>({
  state: List(),
  task: List(),
  output: List(),
}) {}
