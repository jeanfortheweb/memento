import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import sequence, { SequenceTask, accept as sequenceAccept } from './sequence';

export { SequenceTask, sequence };

export default <TState extends State<TStateProps>, TStateProps extends Object>(): Worker<
  TState
> => task$ => Observable.merge(sequenceAccept(task$));
