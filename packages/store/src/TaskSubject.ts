import { Observable, Subject } from '@reactivex/rxjs';
import { Task, TaskObservable } from './core';
import { TaskCreator } from '.';

class TaskSubject extends Subject<Task>
  implements TaskObservable, Observable<Task> {
  public accept<
    TKind extends string = string,
    TPayload = any
  >(kind: TKind | TaskCreator<TKind, TPayload>) {
    return this.filter<Task, Task<TKind, TPayload>>(
      (task): task is Task<TKind, TPayload> =>
        task.kind === kind.toString(),
    );
  }
}

export default TaskSubject;
