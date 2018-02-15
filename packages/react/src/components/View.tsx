import * as React from 'react';
import { Record, is } from 'immutable';
import { Store, Selector } from '@memento/store';
import Render, { RenderFunction } from './Render';

export interface Props<TState extends Record<any>, TOutput> {
  store: Store<TState>;
  children?: RenderFunction<TOutput>;
  selector: Selector<TState>;
}

export interface State<TOutput = any> {
  selector: Selector<any>;
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

  private _updateOutput() {
    this.setState((prevState, props) => ({
      ...prevState,
      output: props.store.select(this.props.selector),
    }));
  }

  private _updateStoreListener() {
    if (this._unsubcribe) {
      this._unsubcribe();
    }

    this._unsubcribe = this.props.store.listen(this._updateOutput.bind(this));
    this._updateOutput();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.selector !== this.props.selector ||
      nextProps.store !== this.props.store ||
      is(nextState.output, this.state.output) === false
    );
  }

  componentWillMount() {
    this._updateStoreListener();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.store !== this.props.store) {
      this._updateStoreListener();
    }

    if (prevProps.selector !== this.props.selector) {
      this._updateOutput();
    }
  }

  componentWillUnmount() {
    this._unsubcribe();
  }

  render() {
    return <Render data={this.state.output}>{this.props.children as RenderFunction<any>}</Render>;
  }
}
