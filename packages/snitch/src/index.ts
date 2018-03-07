import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import {
  listen,
  unlisten,
  ListenTask,
  ListenOnceTask,
  UnListenTask,
  accept as listenAccept,
} from './listen';
import {
  watch,
  unwatch,
  WatchTask,
  WatchOnceTask,
  UnWatchTask,
  accept as watchAccept,
} from './watch';

export { ListenTask, ListenOnceTask, UnListenTask, listen, unlisten };
export { WatchTask, WatchOnceTask, UnWatchTask, watch, unwatch };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => (task$, state$) => Observable.merge(listenAccept(task$), watchAccept(task$, state$));
