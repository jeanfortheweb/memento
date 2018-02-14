import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface PushParameters<TData> {
  path: string;
  data: TData[];
}

export interface PushTask<TState extends State, TData> extends Task<TState>, PushParameters<TData> {
  kind: '@STATE_WORKER/PUSH';
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<PushTask<TState, any>>('@STATE_WORKER/PUSH')
    .map<PushTask<TState, any>, Updater<TState>>(task => state => {
      return state.updateIn(pathToArray(task.path), target => target.push(...task.data));
    });

export default <TState extends State, TData = any>({
  data,
  path,
}: PushParameters<TData>): PushTask<TState, TData> => ({
  kind: '@STATE_WORKER/PUSH',
  path,
  data,
});
