import { Subscription, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, scan } from 'rxjs/operators';
import { Component } from 'react';
import {
  MapInputToActions,
  MapOutputToData,
  ViewCreator,
  ViewProps,
} from './core';

interface ViewState<TActions, TData> {
  actions: TActions;
  data: TData;
  data$: Observable<TData>;
}

export default function view<
  TInput,
  TOutput,
  TActions,
  TData,
  TProps extends {}
>(
  mapInputToActions: MapInputToActions<TInput, TActions, TProps> | null,
  mapOutputToData: MapOutputToData<TOutput, TData, TProps> | null,
): ViewCreator<TInput, TOutput, TActions, TData, TProps> {
  return function create(input, output) {
    return class View extends ViewBase<TActions, TData, TProps> {
      static getDerivedStateFromProps = makeGetDerivedStateFromProps(
        input,
        output,
        mapInputToActions,
        mapOutputToData,
      );
    };
  };
}

function makePropsMemory() {
  let prevProps;

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
  mapInputToActions?,
  mapOutputToData?,
) {
  const propsChanged = makePropsMemory();

  return function(nextProps, prevState) {
    if (propsChanged(nextProps) || !prevState.data$) {
      const data = makeData(output, nextProps, mapInputToActions);
      const actions = makeActions(input, nextProps, mapInputToActions);

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

  return merge<[string, any]>(
    ...Object.keys(data).map(name =>
      data[name].pipe(distinctUntilChanged(), map(value => [name, value])),
    ),
  ).pipe(
    scan<[string, any], any>(
      (output: any, [name, value]) => ({ ...output, [name]: value }),
      {} as any,
    ),
  );
}

function makeActions(input, props, mapInputToActions) {
  if (mapInputToActions) {
    return mapInputToActions(input, props);
  }

  return {};
}

function makeData(output, props, mapOutputToData) {
  if (mapOutputToData) {
    return mapOutputToData(output, props);
  }

  return {};
}

class ViewBase<TActions, TData, TProps> extends Component<
  ViewProps<TActions, TData> & TProps,
  ViewState<TActions, TData>
> {
  protected subscription?: Subscription;

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
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
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
