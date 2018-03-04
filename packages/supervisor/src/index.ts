// timer
// delay
// throttle
// debounce

import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import when, { WhenTask, accept as whenAccept } from './when';
import unless, { UnlessTask, accept as unlessAccept } from './unless';

export { WhenTask, when };
export { UnlessTask, unless };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => (task$, state$) =>
  Observable.merge(whenAccept<TState>(task$, state$), unlessAccept(task$, state$));
