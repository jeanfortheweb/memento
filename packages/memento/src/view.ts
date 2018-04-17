import { Subscription, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, scan, startWith } from 'rxjs/operators';
import { Component } from 'react';
import {
  MapInputToActions,
  MapOutputToData,
  ViewCreator,
  ViewProps,
  ViewState,
} from './core';

function view<
  TInput,
  TOutput,
  TActions,
  TData,
  TProps extends {},
  TOptions extends {}
>(
  mapInputToActions: MapInputToActions<
    TInput,
    TActions,
    TProps,
    TOptions
  > | null,
  mapOutputToData: MapOutputToData<TOutput, TData, TProps, TOptions> | null,
): ViewCreator<TInput, TOutput, TActions, TData, TProps> {
  return function create(input, output, options) {
    return class View extends ViewBase<TActions, TData, TProps> {
      static getDerivedStateFromProps = makeGetDerivedStateFromProps(
        input,
        output,
        options,
        mapInputToActions,
        mapOutputToData,
      );
    };
  };
}

// ignore namespace conditional generated by typescript
// istanbul ignore next
namespace view {
  export function passthrough(
    actions: boolean = true,
    data: boolean = true,
  ): ViewCreator<any> {
    const mapInputToActions = input =>
      Object.keys(input).reduce(
        (actions, name) => ({
          ...actions,
          [name]: value => input[name].next(value),
        }),
        {},
      );

    const mapOutputToData = output => output;

    return view(
      actions ? mapInputToActions : null,
      data ? mapOutputToData : null,
    );
  }
}

export default view;

function makePropsMemory() {
  let prevProps = {};

  return function(nextProps) {
    const propsChanged =
      Object.keys(nextProps).every(
        name => nextProps[name] === prevProps[name],
      ) === false;

    if (propsChanged) {
      prevProps = nextProps;

      return true;
    }

    return false;
  };
}

function makeGetDerivedStateFromProps(
  input,
  output,
  options?,
  mapInputToActions?,
  mapOutputToData?,
) {
  const propsChanged = makePropsMemory();

  return function(nextProps, prevState) {
    if (propsChanged(nextProps) || !prevState.data$) {
      const data = makeData(output, options, nextProps, mapOutputToData);
      const actions = makeActions(input, options, nextProps, mapInputToActions);

      return {
        actions,
        data$: makeDataObservable(data),
        data: undefined as any,
      };
    }

    return prevState;
  };
}

function makeDataObservable(data) {
  if (data instanceof Observable) {
    return data.pipe(distinctUntilChanged());
  }

  let observable = merge<[string, any]>(
    ...Object.keys(data).map(name =>
      data[name].pipe(distinctUntilChanged(), map(value => [name, value])),
    ),
  ).pipe(
    scan<[string, any], any>(
      (output: any, [name, value]) => ({ ...output, [name]: value }),
      {} as any,
    ),
  );

  if (Object.keys(data).length === 0) {
    observable = observable.pipe(startWith({}));
  }

  return observable;
}

function makeActions(input, options, props, mapInputToActions) {
  if (mapInputToActions) {
    return mapInputToActions(input, props, options);
  }

  return {};
}

function makeData(output, options, props, mapOutputToData) {
  if (mapOutputToData) {
    return mapOutputToData(output, props, options);
  }

  return {};
}

class ViewBase<TActions, TData, TProps> extends Component<
  ViewProps<TActions, TData, TProps>,
  ViewState<TActions, TData>
> {
  protected subscription!: Subscription;

  constructor(props) {
    super(props);

    this.state = {} as any;
  }

  componentDidMount() {
    this.subscribe(this.state.data$);
  }

  subscribe(data) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = data.subscribe(data => {
      this.setState(prevState => ({
        ...prevState,
        data,
      }));
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.data$ !== this.state.data$) {
      this.subscribe(this.state.data$);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateChanged =
      Object.keys(nextState).every(
        name => nextState[name] === this.state[name],
      ) === false;

    return stateChanged;
  }

  render() {
    return this.state.data !== undefined
      ? this.props.children(this.state.actions as any, this.state.data)
      : null;
  }
}
