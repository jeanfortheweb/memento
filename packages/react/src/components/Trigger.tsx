import * as React from 'react';
import { Record } from 'immutable';
import { Store, TaskFactory } from '@memento/store';

export interface RenderFunction<TParameters> {
  (trigger: (parameters: TParameters) => void): React.ReactElement<any>;
}

export interface Props<TState extends Record<any>, TParameters> {
  store: Store<TState>;
  factory: TaskFactory<TState, TParameters>;
  children?: RenderFunction<TParameters>;
}

export interface State<TOutput = any> {
  output?: TOutput;
}

export default class Trigger<
  TProps extends Props<any, any> = Props<any, any>
> extends React.PureComponent<TProps, State> {
  public static for<TState extends Record<any>, TParameters>() {
    return Trigger as {
      new (props?: Props<TState, TParameters>): Trigger<Props<TState, TParameters>>;
    };
  }

  handleTrigger = (parameters: any) => {
    const { store, factory } = this.props;

    store.assign(factory(parameters));
  };

  render() {
    const children = this.props.children as RenderFunction<any>;

    return children(this.handleTrigger);
  }
}
