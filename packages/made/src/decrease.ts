import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/DECREASE';

export type DecreaseTask = Task<
  typeof KIND,
  {
    path: string;
    delta: number;
  }
>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
) =>
  task$
    .accept(decrease)
    .map<DecreaseTask, Updater<TState>>(({ payload }) => state =>
      state.updateIn(pathToArray(payload.path), value => value - payload.delta),
    );

export const decrease = (path: string, delta: number = 1): DecreaseTask => ({
  kind: KIND,
  payload: {
    path,
    delta,
  },
});

decrease.toString = () => KIND;

export default decrease;
