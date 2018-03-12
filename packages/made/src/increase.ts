import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/INCREASE';

export type IncreaseTask = Task<
  typeof KIND,
  {
    path: string;
    delta: number | string;
  }
>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept(increase).map<IncreaseTask, Updater<TState>>(({ payload }) => state => {
    const delta =
      typeof payload.delta === 'number'
        ? payload.delta
        : state.getIn(pathToArray(payload.delta));

    return state.updateIn(pathToArray(payload.path), value => value + delta);
  });

export const increase = (path: string, delta: number | string = 1): IncreaseTask => ({
  kind: KIND,
  payload: {
    path,
    delta,
  },
});

increase.toString = () => KIND;

export default increase;
