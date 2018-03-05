import { State, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { Map, Record } from 'immutable';

export const KIND = '@SUPERVISOR/DEBOUNCE';

export type DebounceTask = Task<typeof KIND, { duration: number; creator: () => Task }>;

class Key extends Record<DebounceTask['payload']>({
  duration: 0,
  creator: null as any,
}) {}

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) => {
  let map = Map<Key, Observable<number>>();

  return task$
    .accept(debounce)
    .debounce(task => {
      const key = new Key(task.payload);

      if (!map.has(key)) {
        const timer = Observable.timer(task.payload.duration);

        timer.subscribe({
          next: () => {
            map = map.delete(key);
          },
        });

        map = map.set(key, timer);
      }

      return map.get(key) as Observable<number>;
    })
    .map(task => task.payload.creator());
};

export const debounce = (duration: number, creator: () => Task): DebounceTask => ({
  kind: KIND,
  payload: {
    duration,
    creator,
  },
});

debounce.toString = () => KIND;

export default debounce;
