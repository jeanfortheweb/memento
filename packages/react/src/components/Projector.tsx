import * as React from 'react';
import { Record } from 'immutable';
import { Store, Selector } from '@memento/store';

export interface RenderFunction<TOutput> {
  (data: TOutput): React.ReactElement<any>;
}

export interface Props<TState extends Record<any>, TOutput> {
  store: Store<TState>;
  selector: Selector<TState, TOutput>;
  children?: RenderFunction<TOutput>;
}

export interface State<TOutput = any> {
  output?: TOutput;
}

export default class Projector<
  TProps extends Props<any, any> = Props<any, any>
> extends React.Component<TProps, State> {
  public static for<TState extends Record<any>, TOutput>() {
    return Projector as {
      new (props?: Props<TState, TOutput>): Projector<Props<TState, TOutput>>;
    };
  }

  public static defaultProps: Partial<Props<any, any>> = {
    children: output => output,
  };

  private _unsubcribe?: Function;

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
    if (this._unsubcribe) {
      this._unsubcribe();
    }
  }

  handleStoreUpdate = (prevState, nextState) => {
    this.setState({
      output: this.props.selector(nextState),
    });
  };

  render() {
    const children = this.props.children as RenderFunction<any>;

    if (typeof children === 'function') {
      return children(this.state.output);
    }

    return [this.state.output];
  }
}
