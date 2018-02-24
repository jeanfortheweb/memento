import { Observable, Subject } from '@reactivex/rxjs';
import { Task, TaskObservable } from './core';
import { TaskCreator } from '.';

class TaskSubject extends Subject<Task>
  implements TaskObservable, Observable<Task> {
  public accept<TTask extends Task>(
    kind:
      | TTask['kind']
      | TaskCreator<TTask['kind'], TTask['payload']>,
  ) {
    return this.filter<Task, TTask>(
      (task): task is TTask => task.kind === kind,
    );
  }
}

export default TaskSubject;
