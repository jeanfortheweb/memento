import { State, Task, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

// temporary fix for the observable shadowing.
export let observable: Observable<any>;

export interface SequenceTask<TState extends State> extends Task<TState> {
  kind: '@SEQUENCE_WORKER/SEQUENCE';
  tasks: Task<TState>[];
}

export const accept = <TState extends State>(task$: TaskObservable<TState>) =>
  task$
    .accept<SequenceTask<TState>>('@SEQUENCE_WORKER/SEQUENCE')
    .flatMap<SequenceTask<TState>, Task<TState>>(task => Observable.from(task.tasks));

export default <TState extends State>(...tasks: Task<TState>[]): SequenceTask<TState> => ({
  kind: '@SEQUENCE_WORKER/SEQUENCE',
  tasks,
});
