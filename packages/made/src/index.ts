import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import merge, { MergeTask, accept as mergeAccept } from './merge';
import push, { PushTask, accept as pushAccept } from './push';
import remove, { RemoveTask, accept as removeAccept } from './remove';
import set, { SetTask, accept as setAccept } from './set';
import update, { UpdateTask, accept as updateAccept } from './update';

export { MergeTask, merge };
export { PushTask, push };
export { RemoveTask, remove };
export { SetTask, set };
export { UpdateTask, update };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => task$ =>
  Observable.merge(
    mergeAccept<TState>(task$),
    pushAccept<TState>(task$),
    removeAccept<TState>(task$),
    setAccept<TState>(task$),
    updateAccept<TState>(task$),
  );
