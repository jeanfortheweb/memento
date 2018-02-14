import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface MergeParameters<TData> {
  path?: string;
  data: Partial<TData>;
}

export interface MergeTask<TState extends State, TData>
  extends Task<TState>,
    MergeParameters<TData> {
  kind: '@STATE_WORKER/MERGE';
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<MergeTask<TState, any>>('@STATE_WORKER/MERGE')
    .map<MergeTask<TState, any>, Updater<TState>>(task => state => {
      if (task.path) {
        return state.mergeIn(pathToArray(task.path), task.data);
      }

      return state.merge(task.data);
    });

export default <TState extends State, TData = any>({
  data,
  path,
}: MergeParameters<TData>): MergeTask<TState, TData> => ({
  kind: '@STATE_WORKER/MERGE',
  path,
  data,
});
