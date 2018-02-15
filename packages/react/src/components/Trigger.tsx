import * as React from 'react';
import { Record, Map } from 'immutable';
import { Store } from '@memento/store';
import Render, { RenderFunction } from './Render';

export interface Props<TState extends Record<any>, TProps> {
  store: Store<TState>;
  render?: RenderFunction<TProps>;
  children?: RenderFunction<TProps>;
}

export interface TriggerProps {
  [key: string]: (...parameters: any[]) => void;
}

export default class Trigger<
  TProps extends Props<any, any> = Props<any, any>
> extends React.PureComponent<TProps> {
  public static for<TState extends Record<any>, TProps extends TriggerProps>() {
    return Trigger as {
      new (props?: Props<TState, TProps> & TProps): Trigger<Props<TState, TProps> & TProps>;
    };
  }

  _triggers = {};

  _bindTriggers(props: TProps) {
    const { store } = this.props;

    this._triggers = Object.keys(props).reduce((triggers, prop) => {
      if (prop !== 'store' && prop !== 'render' && prop !== 'children') {
        return { ...triggers, [prop]: (parameters: any) => store.assign(props[prop](parameters)) };
      }

      return triggers;
    }, {});
  }

  componentWillMount() {
    this._bindTriggers(this.props);
  }

  componentWillUpdate(nextProps) {
    this._bindTriggers(nextProps);
  }

  render() {
    return (
      <Render data={this._triggers}>
        {(this.props.children || this.props.render) as RenderFunction<any>}
      </Render>
    );
  }
}
