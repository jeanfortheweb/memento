import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import view from './view';
import {
  InputCreator,
  OutputCreator,
  ModelCreator,
  ViewCreatorSet,
  DefaultViewCreatorSet,
  ViewClassSet,
  ObservableOrOutputSet,
  InputSet,
  Options,
  ConfigurableModelCreator,
} from './core';

export default function model<TInput, TOutput>(
  inputCreator: InputCreator<TInput, null>,
  outputCreator: OutputCreator<TInput, TOutput, null>,
): ModelCreator<TInput, TOutput, DefaultViewCreatorSet<TInput, TOutput>>;

export default function model<
  TInput,
  TOutput,
  TViewCreatorSet extends ViewCreatorSet
>(
  inputCreator: InputCreator<TInput, null>,
  outputCreator: OutputCreator<TInput, TOutput, null>,
  viewCreatorSet: TViewCreatorSet,
): ModelCreator<TInput, TOutput, TViewCreatorSet>;

export default function model<TInput, TOutput, TOptions>(
  inputCreator: InputCreator<TInput, TOptions>,
  outputCreator: OutputCreator<TInput, TOutput, TOptions>,
): ConfigurableModelCreator<
  TInput,
  TOutput,
  TOptions,
  DefaultViewCreatorSet<TInput, TOutput>
>;

export default function model<
  TInput,
  TOutput,
  TOptions,
  TViewCreatorSet extends ViewCreatorSet
>(
  inputCreator: InputCreator<TInput, TOptions>,
  outputCreator: OutputCreator<TInput, TOutput, TOptions>,
  viewCreatorSet: TViewCreatorSet,
): ConfigurableModelCreator<TInput, TOutput, TOptions, TViewCreatorSet>;

export default function model(inputCreator, outputCreator, viewCreators?) {
  return function create(options, lateViewCreators?) {
    const input = createInput(inputCreator, options || {});
    const output = createOutput(outputCreator, input, options || {});
    const views = createViews(
      input,
      output,
      options || {},
      Object.assign({}, viewCreators || {}, lateViewCreators || {}),
    );

    return {
      input,
      output,
      ...views,
    };
  };
}

function createInput<TInput, TOptions>(
  inputCreator: InputCreator<TInput, TOptions>,
  options: Options<TOptions>,
): InputSet<TInput> {
  return inputCreator(options);
}

function createOutput<TInput, TOutput, TOptions>(
  outputCreator: OutputCreator<TInput, TOutput, TOptions>,
  input: InputSet<TInput>,
  options: TOptions,
): ObservableOrOutputSet<any> {
  let output:
    | ObservableOrOutputSet<TOutput>
    | Observable<TOutput> = outputCreator(input, options as any);

  if (output instanceof Observable) {
    output = output.pipe(shareReplay(1));
  } else {
    output = Object.keys(output).reduce((mapped: any, name) => {
      let output$ = output[name].pipe(shareReplay(1));

      output$.subscribe(() => {});

      return {
        ...mapped,
        [name]: output$,
      };
    }, {});
  }

  return output;
}

function createViews<TInput, TOutput, TOptions>(
  input: InputSet<TInput>,
  output: ObservableOrOutputSet<TOutput>,
  options: Options<TOptions>,
  viewCreators: ViewCreatorSet,
): ViewClassSet<ViewCreatorSet, any> {
  let views = {};

  views = Object.keys(viewCreators).reduce(
    (views, name) => ({
      ...views,
      [name]: viewCreators[name](input, output, options),
    }),
    {},
  ) as any;

  if (Object.keys(views).length === 0) {
    views = {
      View: view.passthrough()(input, output, options),
      ActionView: view.passthrough(true, false)(input, output, options),
      DataView: view.passthrough(false, true)(input, output, options),
    };
  }

  return views;
}
