import { Observable } from '@reactivex/rxjs';
import { Map, Record } from 'immutable';

export const KIND = '@SUPERVISOR/DEBOUNCE';

class Key extends Record<any>({}) {}

export const createTimerTable = <T>() => {
  let table: Map<Key, Observable<number>> = Map();

  return (keyValue: T, duration: number) => {
    const key = new Key(keyValue);

    if (!table.has(key)) {
      const timer = Observable.timer(duration);
      const subscription = timer.subscribe({
        complete: () => {
          table = table.delete(key);
          subscription.unsubscribe();
        },
      });

      table = table.set(key, timer);
    }

    return table.get(key) as Observable<number>;
  };
};
