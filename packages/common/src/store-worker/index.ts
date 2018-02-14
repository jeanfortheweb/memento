import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import merge, { MergeTask, MergeParameters, accept as mergeAccept } from './merge';
import push, { PushTask, PushParameters, accept as pushAccept } from './push';

export { MergeTask, MergeParameters, merge };
export { PushTask, PushParameters, push };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => task$ => Observable.merge(mergeAccept(task$), pushAccept(task$));
