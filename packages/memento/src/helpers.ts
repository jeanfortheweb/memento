import { Observable, merge } from 'rxjs';
import {
  distinctUntilChanged,
  startWith,
  map,
  scan,
  shareReplay,
} from 'rxjs/operators';

export interface Updater<S> {
  (state: S): S;
}

function state<S>(initialState: S, ...actions: Observable<Updater<S>>[]) {
  return merge(...actions)
    .pipe<S>(
      scan<Updater<S>, S>((current, updater) => updater(current), initialState),
    )
    .pipe(distinctUntilChanged(), startWith(initialState), shareReplay(1));
}

namespace state {
  export function action<I, S>(
    input: Observable<I>,
    reducer: (input: I) => Updater<S>,
  ) {
    return input.pipe(map(reducer));
  }
}

export { state };
