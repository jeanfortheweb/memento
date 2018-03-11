import { Task, TaskObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND = '@SUPERVISOR/SEQUENCE';

export type SequenceTask = Task<typeof KIND, Task[]>;

export const accept = (task$: TaskObservable & Observable<Task>) =>
  task$.accept(sequence).flatMap(task => Observable.from(task.payload));

export const sequence = (...tasks: Task[]): SequenceTask => ({
  kind: KIND,
  payload: tasks,
});

sequence.toString = () => KIND;

export default sequence;
