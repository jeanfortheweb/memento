// timer
// delay
// throttle
// debounce

import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { when, WhenTask, accept as whenAccept } from './when';
import { unless, UnlessTask, accept as unlessAccept } from './unless';
import { from, FromTask, accept as fromAccept } from './from';

export { WhenTask, when };
export { UnlessTask, unless };
export { FromTask, fromAccept, from };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => (task$, state$) =>
  Observable.merge(
    whenAccept<TState>(task$, state$),
    unlessAccept<TState>(task$, state$),
    fromAccept<TState>(task$, state$),
  );
