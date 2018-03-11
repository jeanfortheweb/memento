import { State, Worker, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration, Target, SaveMode } from './configuration';
import { pathToArray, getStorageKey } from './utils';
import { Collection } from 'immutable';

export const KIND = '@CLERK/SAVE';

export type SaveTask = Task<typeof KIND, string>;

export const accept = <TState extends State>(
  configuration: Configuration,
): Worker<TState> => (
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  const { path, name, target, interval = 5000 } = configuration;
  const key = getStorageKey(name);
  const selector = state => state.getIn(pathToArray(path));
  const storage = target === Target.Local ? localStorage : sessionStorage;

  let output$: Observable<Collection<any, any>>;

  switch (configuration.save) {
    case SaveMode.Auto:
      output$ = state$.select(selector);
      break;

    case SaveMode.Interval:
      output$ = Observable.interval(interval).flatMap(() =>
        state$.select(selector).take(1),
      );
      break;

    case SaveMode.Manual:
    default:
      output$ = task$
        .accept(save)
        .filter(task => task.payload === configuration.name)
        .flatMap(task => state$.select(selector).take(1));
      break;
  }

  return output$
    .do(data => {
      storage.setItem(key, JSON.stringify(data));
    })
    .mapTo(state => state);
};

export const save = (name: string): SaveTask => ({
  kind: KIND,
  payload: name,
});

save.toString = () => KIND;

export default save;
