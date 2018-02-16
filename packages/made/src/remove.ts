import { State, Task, Updater, TaskObservable } from '@memento/store';
import { List } from 'immutable';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface RemoveTask<TState extends State, TData> extends Task<TState> {
  kind: '@STATE_WORKER/REMOVE';
  path: string;
  data: TData[];
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<RemoveTask<TState, any>>('@STATE_WORKER/REMOVE')
    .map<RemoveTask<TState, any>, Updater<TState>>(task => state => {
      return state.updateIn(pathToArray(task.path), (target: List<any>) =>
        task.data.reduce<List<any>>(
          (newTarget, item) => newTarget.remove(newTarget.indexOf(item)),
          target,
        ),
      );
    });

export default <TState extends State, TData = any>(
  path: string,
  ...data: TData[]
): RemoveTask<TState, TData> => ({
  kind: '@STATE_WORKER/REMOVE',
  path,
  data,
});
