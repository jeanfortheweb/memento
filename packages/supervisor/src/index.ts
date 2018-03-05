// timer
// delay
// throttle
// debounce

import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { when, WhenTask, accept as whenAccept } from './when';
import { unless, UnlessTask, accept as unlessAccept } from './unless';
import { from, FromTask, accept as fromAccept } from './from';
import { throttle, ThrottleTask, accept as throttleAccept } from './throttle';

export { WhenTask, when };
export { UnlessTask, unless };
export { FromTask, from };
export { ThrottleTask, throttle };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => (task$, state$) =>
  Observable.merge(
    whenAccept<TState>(task$, state$),
    unlessAccept<TState>(task$, state$),
    fromAccept<TState>(task$, state$),
    throttleAccept<TState>(task$, state$),
  );
