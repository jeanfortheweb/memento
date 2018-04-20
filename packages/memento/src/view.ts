import { Subscription, merge, Observable } from 'rxjs';
import { distinctUntilChanged, map, scan, startWith } from 'rxjs/operators';
import { Component, GetDerivedStateFromProps } from 'react';
import {
  ActionCreator,
  DataCreator,
  ViewCreator,
  ViewProps,
  ViewState,
  InputSet,
  OutputOrOutputSet,
  ActionSet,
  ViewCreatorProps,
} from './core';

function view<TInput, TOutput, TProps, TOptions>(): ViewCreator<
  TInput,
  TOutput,
  null,
  null,
  TProps,
  TOptions
>;

function view<TInput, TOutput, TData, TProps, TOptions>(
  actionCreator: null,
  dataCreator: DataCreator<TOutput, TData, TProps, TOptions>,
): ViewCreator<TInput, TOutput, null, TData, TProps, TOptions>;

function view<TInput, TOuput, TActions, TProps, TOptions>(
  actionCreator: ActionCreator<TInput, TActions, TProps, TOptions>,
): ViewCreator<TInput, TOuput, TActions, null, TProps, TOptions>;

function view<TInput, TOutput, TActions, TData, TProps, TOptions>(
  actionCreator: ActionCreator<TInput, TActions, TProps, TOptions>,
  dataCreator: DataCreator<TOutput, TData, TProps, TOptions>,
): ViewCreator<TInput, TOutput, TActions, TData, TProps, TOptions>;

function view<TInput, TOutput, TActions, TData, TProps, TOptions>(
  actionCreator?: ActionCreator<TInput, TActions, TProps, TOptions> | null,
  dataCreator?: DataCreator<TOutput, TData, TProps, TOptions>,
): ViewCreator<TInput, TOutput, TActions, TData, TProps, TOptions> {
  return function create(input, output, options) {
    return class View extends ViewBase<TActions, TData, TProps> {
      static getDerivedStateFromProps = createGetDerivedStateFromProps(
        input,
        output,
        actionCreator ? actionCreator : null,
        dataCreator ? dataCreator : null,
        options,
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
    const actionCreator = input =>
      Object.keys(input).reduce(
        (actions, name) => ({
          ...actions,
          [name]: value => input[name].next(value),
        }),
        {},
      );

    const dataCreator = output => output;

    if (actions && data) {
      return view(actionCreator, dataCreator);
    }

    if (actions) {
      return view(actionCreator);
    }

    if (data) {
      return view(null, dataCreator);
    }

    return view();
  }
}

export default view;

function memory<TProps>() {
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

function createGetDerivedStateFromProps<
  TInput extends {},
  TOutput extends {},
  TActions extends {},
  TData extends {},
  TProps extends {},
  TOptions extends {}
>(
  input: InputSet<TInput>,
  output: OutputOrOutputSet<TOutput>,
  actionCreator: ActionCreator<TInput, TActions, TProps, TOptions> | null,
  dataCreator: DataCreator<TOutput, TData, TProps, TOptions> | null,
  options: TOptions | {},
): GetDerivedStateFromProps<
  ViewCreatorProps<TProps>,
  ViewState<TActions, TData>
> {
  const propsChanged = memory();

  return function(nextProps, prevState) {
    if (propsChanged(nextProps) || !prevState.observable) {
      const actions = createActions(actionCreator, input, nextProps, options);
      const data = createData(dataCreator, output, nextProps, options);

      return {
        actions,
        observable: createObservable(data),
        data: undefined as any,
      };
    }

    return prevState;
  };
}

function createObservable<TData>(
  data: Readonly<OutputOrOutputSet<TData>>,
): Observable<TData> {
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
    observable = observable.pipe(startWith(null));
  }

  return observable;
}

function createActions<TInput, TActions, TProps, TOptions>(
  actionCreator: ActionCreator<TInput, TActions, TProps, TOptions> | null,
  input: InputSet<TInput>,
  props: Readonly<ViewCreatorProps<TProps>>,
  options: TOptions | {},
): Readonly<ActionSet<TActions>> {
  if (actionCreator) {
    return actionCreator(input, props, options);
  }

  return {} as any;
}

function createData<TOutput, TData, TProps, TOptions>(
  dataCreator: DataCreator<TOutput, TData, TProps, TOptions> | null,
  output: OutputOrOutputSet<TOutput>,
  props: Readonly<ViewCreatorProps<TProps>>,
  options: TOptions | {},
): Readonly<OutputOrOutputSet<TData>> {
  if (dataCreator) {
    return dataCreator(output, props, options);
  }

  return {} as any;
}

class ViewBase<TActions, TData, TProps> extends Component<
  ViewProps<TActions, TData> & ViewCreatorProps<TProps>,
  ViewState<TActions, TData>
> {
  protected subscription!: Subscription;

  constructor(props) {
    super(props);

    this.state = {} as any;
  }

  componentDidMount() {
    this.subscribe(this.state.observable);
  }

  subscribe(observable) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = observable.subscribe(data => {
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
    if (prevState.observable !== this.state.observable) {
      this.subscribe(this.state.observable);
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
    if (this.state.data !== undefined) {
      if (this.props.children) {
        return (this.props.children as Function)(
          this.state.actions,
          this.state.data,
        );
      }

      return String(this.state.data);
    }

    return null;
  }
}
