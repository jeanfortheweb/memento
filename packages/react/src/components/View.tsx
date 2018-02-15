import * as React from 'react';
import { Record, Map, is } from 'immutable';
import { Store, Selector } from '@memento/store';
import Render, { RenderFunction } from './Render';

export type Props<TState extends Record<any>, TProps, TOutput> = {
  store: Store<TState>;
  compute?: (props: TProps) => TOutput;
  children?: RenderFunction<TOutput>;
};

export interface State {
  output?: any;
}

export type InputProps<TState extends Record<any>, T> = {
  [P in keyof T]: Selector<TState, T[P]> | T[P]
};

export default class View<
  TProps extends Props<any, any, any> = Props<any, any, any>
> extends React.Component<TProps, State> {
  public static for<TState extends Record<any>, TProps, TOutput = TProps>() {
    return View as {
      new (props?: Props<TState, TProps, TOutput> & InputProps<TState, TProps>): View<
        Props<TState, TProps, TOutput> & InputProps<TState, TProps>
      >;
    };
  }

  private _unsubcribe: Function = () => null;
  private _cache = Map();

  constructor(props: TProps) {
    super(props);
  }

  private _listen(store: Store<any>) {
    this._unsubcribe();
    this._unsubcribe = store.listen(this._compute.bind(this));
    this._compute(store.select(state => state), store.select(state => state));
  }

  private _propertiesChanged(props: any) {
    const nextCache = Object.keys(props).reduce((output, prop) => {
      if (prop !== 'store' && typeof props[prop] !== 'function') {
        return output.set(prop, props[prop]);
      }

      return output;
    }, this._cache);

    return nextCache !== this._cache;
  }

  private _outputChanged(nextState: State) {
    return is(nextState.output, this.state.output) === false;
  }

  private _compute(
    prevState: Record<any>,
    nextState: Record<any>,
    propsToUse: TProps = this.props,
  ) {
    const { store, compute, ...props } = propsToUse as any;
    const data = Object.keys(props).reduce((output, prop) => {
      if (prop !== 'children') {
        if (typeof props[prop] === 'function') {
          return { ...output, [prop]: props[prop](nextState) };
        }

        return { ...output, [prop]: props[prop] };
      }

      return output;
    }, {});

    const nextCache = this._cache.merge(data);

    if (nextCache !== this._cache) {
      this._cache = nextCache;
      const output = typeof compute === 'function' ? compute(data) : data;

      this.setState(prevState => ({
        ...prevState,
        output,
      }));
    }
  }

  shouldComponentUpdate(nextProps: TProps, nextState: State) {
    return this._outputChanged(nextState);
  }

  componentWillReceiveProps(nextProps: TProps) {
    if (nextProps.store !== this.props.store) {
      this._listen(nextProps.store);
    }

    if (this._propertiesChanged(nextProps)) {
      this._compute(
        nextProps.store.select(state => state),
        nextProps.store.select(state => state),
        nextProps,
      );
    }
  }

  componentWillMount() {
    this._listen(this.props.store);
    this._compute(this.props.store.select(state => state), this.props.store.select(state => state));
  }

  componentWillUnmount() {
    this._unsubcribe();
  }

  render() {
    return <Render data={this.state.output}>{this.props.children as RenderFunction<any>}</Render>;
  }
}
