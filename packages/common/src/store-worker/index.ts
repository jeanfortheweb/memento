import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import merge, { MergeTask, accept as mergeAccept } from './merge';
import push, { PushTask, accept as pushAccept } from './push';

export { MergeTask, merge };
export { PushTask, push };

export const createStoreWorker = <
  TState extends State<TStateProps>,
  TStateProps extends Object
>(): Worker<TState> => task$ => Observable.merge(mergeAccept(task$), pushAccept(task$));
