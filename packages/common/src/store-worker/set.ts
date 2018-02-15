import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface SetTask<TState extends State, TData> extends Task<TState> {
  kind: '@STATE_WORKER/SET';
  path: string;
  data: Partial<TData>;
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<SetTask<TState, any>>('@STATE_WORKER/SET')
    .map<SetTask<TState, any>, Updater<TState>>(task => state => {
      return state.setIn(pathToArray(task.path), task.data);
    });

export default <TState extends State, TData = any>(
  path: string,
  data: Partial<TData>,
): SetTask<TState, TData> => ({
  kind: '@STATE_WORKER/SET',
  path,
  data,
});
