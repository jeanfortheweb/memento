import { Action, Store, State } from '../core';

export default abstract class<TState extends State> implements Action<TState> {
  public abstract dispatch(store: Store<TState>);
}
