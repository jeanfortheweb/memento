import { State, Task, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface SequenceParameters<TState extends State> {
  tasks: Task<TState>[];
}

export interface SequenceTask<TState extends State>
  extends Task<TState>,
    SequenceParameters<TState> {
  kind: '@SEQUENCE_WORKER/SEQUENCE';
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<SequenceTask<TState>>('@SEQUENCE_WORKER/SEQUENCE')
    .flatMap<SequenceTask<TState>, Task<TState>>(task => Observable.from(task.tasks));

export default <TState extends State>({
  tasks,
}: SequenceParameters<TState>): SequenceTask<TState> => ({
  kind: '@SEQUENCE_WORKER/SEQUENCE',
  tasks,
});
