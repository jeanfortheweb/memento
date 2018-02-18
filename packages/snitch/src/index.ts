import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import { listen, unlisten, ListenTask, UnListenTask, accept as listenAccept } from './listen';

export { ListenTask, UnListenTask, listen, unlisten };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => task$ => Observable.merge(listenAccept(task$));
