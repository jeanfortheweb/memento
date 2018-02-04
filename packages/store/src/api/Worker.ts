import { Class, State, Task, Action } from '../core';
import { Observable } from '@reactivex/rxjs';

export default abstract class<TState extends State, TTask extends Task<TState>> {
  public abstract for(): Class<TTask>;
  public abstract setup(task$: Observable<TTask>): Observable<Action<TState>>;
}
