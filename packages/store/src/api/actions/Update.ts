import Action from '../Action';
import { State, Store, Updater } from '../../core';

export default class<TState extends State> extends Action<TState> {
  private _updater: Updater<TState>;

  constructor(updater: Updater<TState>) {
    super();
    this._updater = updater;
  }

  public dispatch(store: Store<TState>) {
    store.update(this._updater);
  }
}
