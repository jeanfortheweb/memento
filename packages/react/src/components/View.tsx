import * as React from 'react';
import { Record } from 'immutable';
import { Store, Selector } from '@memento/store';
import Render, { RenderFunction } from './Render';

export interface Props<TState extends Record<any>, TOutput> {
  store: Store<TState>;
  selector: Selector<TState, TOutput>;
  children?: RenderFunction<TOutput>;
}

export interface State<TOutput = any> {
  output?: TOutput;
}

export default class View<TProps extends Props<any, any> = Props<any, any>> extends React.Component<
  TProps,
  State
> {
  public static for<TState extends Record<any>, TOutput>() {
    return View as {
      new (props?: Props<TState, TOutput>): View<Props<TState, TOutput>>;
    };
  }

  private _unsubcribe: Function = () => null;

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextState.output === this.state.output);
  }

  componentWillMount() {
    this._unsubcribe = this.props.store.listen(this.handleStoreUpdate);

    this.setState({
      output: this.props.store.select(this.props.selector),
    });
  }

  componentWillUnmount() {
    this._unsubcribe();
  }

  handleStoreUpdate = (prevState, nextState) => {
    this.setState({
      output: this.props.selector(nextState),
    });
  };

  render() {
    return <Render data={this.state.output}>{this.props.children as RenderFunction<any>}</Render>;
  }
}
