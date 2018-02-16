import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface MergeTask<TState extends State, TData> extends Task<TState> {
  kind: '@STATE_WORKER/MERGE';
  data: Partial<TData>;
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<MergeTask<TState, any>>('@STATE_WORKER/MERGE')
    .map<MergeTask<TState, any>, Updater<TState>>(task => state => {
      return state.merge(task.data);
    });

export default <TState extends State, TData = any>(
  data: Partial<TData>,
): MergeTask<TState, TData> => ({
  kind: '@STATE_WORKER/MERGE',
  data,
});
