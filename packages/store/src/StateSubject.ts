import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { State, Selector, StateObservable } from './core';

export interface SelectorMemory<TOutput = any> {
  previous: TOutput;
  current: TOutput;
}

class StateSubject<TState extends State> extends BehaviorSubject<TState>
  implements StateObservable<TState> {
  public select<T>(selector: Selector<TState, T>): Observable<T> {
    const memory: Observable<SelectorMemory<T>> = this.scan<TState, Partial<SelectorMemory<T>>>(
      (acc, value) => ({
        previous: acc.current,
        current: selector(value),
      }),
      {},
    ) as Observable<SelectorMemory<T>>;

    return memory
      .filter<SelectorMemory<T>>(value => value.previous !== value.current)
      .map<SelectorMemory<T>, T>(value => value.current);
  }
}

export default StateSubject;
