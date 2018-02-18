import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import listen, { ListenTask, accept as listenAccept } from './listen';

export { ListenTask, listen };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => task$ => Observable.merge(listenAccept(task$));
