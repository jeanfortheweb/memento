import { Task, State } from '../core';

export default class<TState extends State, TParameters extends Object = any>
  implements Task<TState> {
  public readonly state?: TState;
  public readonly parameters?: TParameters;

  constructor(parameters?: TParameters) {
    this.parameters = parameters;
  }
}
