import { State, Task, Updater, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { pathToArray } from './utils';

export const KIND = '@MADE/DECREASE';

export type DecreaseTask = Task<
  typeof KIND,
  {
    path: string;
    delta: number | string;
  }
>;

export const accept = <TState extends State>(task$: TaskObservable & Observable<Task>) =>
  task$.accept(decrease).map<DecreaseTask, Updater<TState>>(({ payload }) => state => {
    const delta =
      typeof payload.delta === 'number'
        ? payload.delta
        : state.getIn(pathToArray(payload.delta));

    return state.updateIn(pathToArray(payload.path), value => value - delta);
  });

export const decrease = (path: string, delta: number | string = 1): DecreaseTask => ({
  kind: KIND,
  payload: {
    path,
    delta,
  },
});

decrease.toString = () => KIND;

export default decrease;
