import * as React from 'react';
import { Record } from 'immutable';
import { Store, Selector, SelectorOutput } from '@memento/store';

export interface RenderFunction<TSelectorOutput extends SelectorOutput<any>> {
  (data: TSelectorOutput): React.ReactElement<any>;
}

export interface Props<TState extends Record<any>, TSelectorOutput extends SelectorOutput<any>> {
  store: Store<TState>;
  selector: Selector<TState, TSelectorOutput>;
  children?: RenderFunction<TSelectorOutput>;
}

export interface State<TSelectorOutput extends SelectorOutput<any> = any> {
  output?: TSelectorOutput;
}

export default class Projector<
  TProps extends Props<any, any>,
  TState extends State = State
> extends React.Component<TProps, TState> {
  public static for<TState extends Record<any>, TSelectorOutput extends SelectorOutput<any>>() {
    return Projector as {
      new (props?: Props<TState, TSelectorOutput>): Projector<
        Props<TState, TSelectorOutput>,
        State<TSelectorOutput>
      >;
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
    this._unsubcribe = this.props.store.subscribe(this.handleStoreUpdate);

    this.setState({
      output: this.props.selector(this.props.store.state),
    });
  }

  componentWillUnmount() {
    if (this._unsubcribe) {
      this._unsubcribe();
    }
  }

  handleStoreUpdate = (store, prevState, nextState) => {
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
