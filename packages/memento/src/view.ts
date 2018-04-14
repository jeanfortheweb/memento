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
    return class View extends Component<
      ViewProps<TActions, TData> & TProps,
      ViewState<TActions, TData>
    > {
      protected subscription?: Subscription;

      static prevProps: any = {};
      static propsChanged(nextProps) {
        return (
          Object.keys(nextProps).every(
            name => nextProps[name] === View.prevProps[name],
          ) === false
        );
      }

      static getDerivedStateFromProps(
        nextProps: Readonly<ViewProps<TActions, TData> & TProps>,
        prevState: ViewState<TActions, TData>,
      ): ViewState<TActions, TData> {
        if (View.propsChanged(nextProps) || !prevState.data$) {
          let data = {};
          let data$;
          let actions: any = {};

          if (mapInputToActions) {
            actions = mapInputToActions(input, nextProps);
          }

          if (mapOutputToData) {
            data = mapOutputToData(output, nextProps);
          }

          if (data instanceof Observable) {
            data$ = data.pipe(distinctUntilChanged());
          } else {
            data$ = merge<[string, any]>(
              ...Object.keys(data).map(name =>
                data[name].pipe(
                  distinctUntilChanged(),
                  map(value => [name, value]),
                ),
              ),
            ).pipe(
              scan<[string, any], TData>(
                (output: any, [name, value]) => ({ ...output, [name]: value }),
                {} as any,
              ),
            );
          }

          View.prevProps = nextProps;

          return {
            actions,
            data$: data$,
            data: undefined as any,
          };
        }

        return prevState;
      }

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
    };
  };
}
