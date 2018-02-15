import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface UpdateTask<TState extends State> extends Task<TState> {
  kind: '@STATE_WORKER/UPDATE';
  updater: Updater<TState>;
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<UpdateTask<TState>>('@STATE_WORKER/UPDATE')
    .map<UpdateTask<TState>, Updater<TState>>(task => state => {
      return task.updater(state);
    });

export default <TState extends State>(updater: Updater<TState>): UpdateTask<TState> => ({
  kind: '@STATE_WORKER/UPDATE',
  updater,
});
