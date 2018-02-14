import * as React from 'react';
import { Record } from 'immutable';
import { Store, TaskFactory } from '@memento/store';
import Render, { RenderFunction } from './Render';

export interface Props<TState extends Record<any>, TParameters> {
  store: Store<TState>;
  factory: TaskFactory<TState, TParameters>;
  children?: RenderFunction<(parameters: TParameters) => void>;
}

export default class Trigger<
  TProps extends Props<any, any> = Props<any, any>
> extends React.PureComponent<TProps> {
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
    return <Render data={this.handleTrigger}>{this.props.children as RenderFunction<any>}</Render>;
  }
}
