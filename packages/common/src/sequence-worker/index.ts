import { Worker, State } from '@memento/store';
import { Observable } from '@reactivex/rxjs';
import sequence, { SequenceTask, SequenceParameters, accept as sequenceAccept } from './sequence';

export { SequenceTask, SequenceParameters, sequence };

export const createSequenceWorker = <
  TState extends State<TStateProps>,
  TStateProps extends Object
>(): Worker<TState> => task$ => Observable.merge(sequenceAccept(task$));
