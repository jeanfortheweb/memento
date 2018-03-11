import {
  State,
  Worker,
  Task,
  TaskObservable,
  StateObservable,
  Updater,
} from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Configuration, Target, SaveMode } from './configuration';
import { pathToArray, getStorageKey } from './utils';

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

  let output$: Observable<Updater<TState> | Task> = task$
    .accept(save)
    .filter(task => task.payload === configuration.name)
    .flatMap(task => state$.select(selector).take(1))
    .do(data => {
      storage.setItem(key, JSON.stringify(data));
    })
    .mapTo(state => state);

  if (configuration.save === SaveMode.Auto) {
    output$ = Observable.merge(
      output$,
      state$
        .select(selector)
        .skip(1)
        .mapTo(save(name)),
    );
  }

  if (configuration.save === SaveMode.Interval) {
    output$ = Observable.merge(output$, Observable.interval(interval).mapTo(save(name)));
  }

  return output$;
};

export const save = (name: string): SaveTask => ({
  kind: KIND,
  payload: name,
});

save.toString = () => KIND;

export default save;
