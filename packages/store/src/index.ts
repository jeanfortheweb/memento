import { Record, List } from 'immutable';

export type Reaction<TState extends Record<any>> = TState | Command<TState>;

export interface Action<TState extends Record<any>> {
  (state: TState): Reaction<TState>;
}

export interface Subscriber<TState extends Record<any>> {
  (store: Store<TState>, prevState: TState, nextState: TState): void;
}

export type SelectorOutput<T> = T;

export interface Selector<TState extends Record<any>, TOutput extends SelectorOutput<any>> {
  (state: TState, ...args: any[]): TOutput;
}

export abstract class Command<TState extends Record<any>> {
  public abstract run(): IterableIterator<Instruction>;

  protected call(method: Function, ...args: any[]): Instruction {
    return {
      kind: 'call',
      method,
      args,
    };
  }

  protected select<TOutput>(selector: Selector<TState, TOutput>, ...args: any[]): Instruction {
    return {
      kind: 'select',
      selector,
      args,
    };
  }

  protected dispatch(action: Action<TState>): Instruction {
    return {
      kind: 'dispatch',
      action,
    };
  }

  protected execute(command: Command<TState>): Instruction {
    return {
      kind: 'execute',
      command,
    };
  }

  protected resolve(value: any): Instruction {
    return {
      kind: 'resolve',
      value,
    };
  }
}

export interface Call {
  kind: 'call';
  method: Function;
  args: any[];
}

export interface Dispatch {
  kind: 'dispatch';
  action: Action<any>;
}

export interface Execute {
  kind: 'execute';
  command: Command<any>;
}

export interface Select {
  kind: 'select';
  selector: Selector<any, any>;
  args: any[];
}

export interface Resolve {
  kind: 'resolve';
  value: any;
}

export type Instruction = Call | Dispatch | Execute | Select | Resolve;

export class Store<TState extends Record<any>> {
  private _state: TState;
  private _subscriptions: List<Subscriber<TState>>;

  public get state(): TState {
    return this._state;
  }

  constructor(initialState: TState) {
    this._state = initialState;
    this._subscriptions = List();
  }

  execute(command: Command<TState>): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const iterator = command.run();
        const next = (iteratorResult: IteratorResult<Instruction>) => {
          const { value, done } = iteratorResult;

          if (value) {
            switch (value.kind) {
              case 'call':
                try {
                  const result = value.method.apply(null, value.args);

                  if (result && typeof (result as Promise<any>).then === 'function') {
                    result.then(result => next(iterator.next(result))).catch(error => {
                      if (iterator.throw) {
                        next(iterator.throw(error));
                      } else {
                        next(iterator.next(error));
                      }
                    });
                  } else {
                    next(iterator.next(result));
                  }
                } catch (error) {
                  if (iterator.throw) {
                    next(iterator.throw(error));
                  } else {
                    next(iterator.next(error));
                  }
                }

                break;

              case 'dispatch':
                next(iterator.next(this.dispatch(value.action)));
                break;

              case 'execute':
                this.execute(value.command)
                  .then(result => next(iterator.next(result)))
                  .catch(error => {
                    if (iterator.throw) {
                      next(iterator.throw(error));
                    } else {
                      next(iterator.next(error));
                    }
                  });
                break;

              case 'select':
                next(
                  iterator.next(value.selector.apply(value.selector, [this.state, ...value.args])),
                );
                break;

              case 'resolve':
                resolve(value.value);
                return;

              default:
                console.log(value);
                break;
            }
          }

          if (done) {
            resolve();
          }
        };

        next(iterator.next(this.state));
      } catch (error) {
        reject(error);
      }
    });
  }

  dispatch(action: Action<TState>) {
    const reaction = action(this.state);

    if (reaction instanceof Command) {
      this.execute(reaction);
      return;
    }

    if (Object.getPrototypeOf(reaction) === Object.getPrototypeOf(this.state)) {
      const prevState = this.state;
      const nextState = reaction as TState;

      this._state = nextState;

      if (nextState !== prevState) {
        this._subscriptions.forEach(watcher => watcher(this, prevState, nextState));
      }

      return;
    }

    throw new Error(`An action resulted in an invalid reaction`);
  }

  subscribe(subscriber: Subscriber<TState>) {
    this._subscriptions = this._subscriptions.push(subscriber);

    return () => {
      this._subscriptions = this._subscriptions.remove(this._subscriptions.indexOf(subscriber));
    };
  }
}
