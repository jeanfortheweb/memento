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
  public abstract execute(): IterableIterator<Instruction>;

  protected call<TResult>(
    method: (...args: any[]) => Promise<TResult> | TResult,
    ...args: any[]
  ): Instruction {
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
}

export interface Resolve {
  kind: 'call';
  method: () => Promise<any> | any;
  args: any[];
}

export interface Dispatch {
  kind: 'dispatch';
  action: Action<any>;
}

export interface Select {
  kind: 'select';
  selector: Selector<any, any>;
  args: any[];
}

export type Instruction = Resolve | Dispatch | Select;

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

  execute(command: Command<TState>) {
    return new Promise(resolve => {
      const iterator = command.execute();
      const next = (iteratorResult: IteratorResult<Instruction>) => {
        const { value, done } = iteratorResult;

        if (value) {
          switch (value.kind) {
            case 'call':
              const result = value.method.apply(value.method, value.args);

              if (result && typeof (result as Promise<any>).then === 'function') {
                result
                  .then(result => next(iterator.next(result)))
                  .catch(error => next(iterator.next(error)));
              } else {
                next(iterator.next(result));
              }
              break;

            case 'dispatch':
              next(iterator.next(this.dispatch(value.action)));
              break;

            case 'select':
              next(
                iterator.next(value.selector.apply(value.selector, [this.state, ...value.args])),
              );
              break;
          }
        }

        if (done) {
          resolve();
        }
      };

      next(iterator.next(this.state));
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
