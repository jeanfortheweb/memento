import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/INCREASE';

export type IncreaseTask = Task<
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
    .accept(increase)
    .map<IncreaseTask, Updater<TState>>(({ payload }) => state =>
      state.updateIn(pathToArray(payload.path), value => value + payload.delta),
    );

export const increase = (path: string, delta: number = 1): IncreaseTask => ({
  kind: KIND,
  payload: {
    path,
    delta,
  },
});

increase.toString = () => KIND;

export default increase;
