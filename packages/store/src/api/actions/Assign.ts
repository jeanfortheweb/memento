import Action from '../Action';
import { State, Store, Task } from '../../core';

export default class<TState extends State, TTask extends Task<TState>> extends Action<TState> {
  private _task: TTask;

  constructor(task: TTask) {
    super();
    this._task = task;
  }

  public dispatch(store: Store<TState>) {
    store.assign(this._task);
  }
}
