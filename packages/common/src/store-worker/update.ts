import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { List, merge } from 'immutable';
import { pathToArray } from './utils';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface UpdateTask<TState extends State, TData> extends Task<TState> {
  kind: '@STATE_WORKER/UPDATE';
  path: string;
  element: TData;
  data: Partial<TData>;
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<UpdateTask<TState, any>>('@STATE_WORKER/UPDATE')
    .map<UpdateTask<TState, any>, Updater<TState>>(task => state =>
      state.updateIn(pathToArray(task.path), (target: List<any>) =>
        target.update(target.indexOf(task.element), element => merge(element, task.data)),
      ),
    );

export default <TState extends State, TData = any>(
  path: string,
  element: TData,
  data: Partial<TData>,
): UpdateTask<TState, TData> => ({
  kind: '@STATE_WORKER/UPDATE',
  path,
  element,
  data,
});
