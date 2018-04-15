import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import view from './view';
import {
  InputCreator,
  OutputCreator,
  ModelCreator,
  ViewCreators,
  DefaultViewCreators,
  ViewComponentClasses,
  Output,
  Input,
} from './core';

export default function model<TInput, TOutput>(
  inputCreator: InputCreator<TInput, never>,
  outputCreator: OutputCreator<TInput, TOutput, never>,
): ModelCreator<TInput, TOutput, never, DefaultViewCreators<TInput, TOutput>>;

export default function model<
  TInput,
  TOutput,
  TViewCreators extends ViewCreators<TViewCreators>
>(
  inputCreator: InputCreator<TInput, never>,
  outputCreator: OutputCreator<TInput, TOutput, never>,
  viewCreators: TViewCreators,
): ModelCreator<TInput, TOutput, never, TViewCreators>;

export default function model<
  TInput,
  TOutput,
  TOptions,
  TViewCreators extends ViewCreators
>(
  inputCreator: InputCreator<TInput, TOptions>,
  outputCreator: OutputCreator<TInput, TOutput, TOptions>,
  viewCreators: TViewCreators,
): ModelCreator<TInput, TOutput, TOptions, TViewCreators>;

export default function model(inputCreator, outputCreator, viewCreators?) {
  return function create(options?) {
    const input = inputCreator(options as any);
    const output = makeOutput(outputCreator, input, options);
    const views = makeViews(input, output, viewCreators);

    return {
      input,
      output,
      ...views,
    };
  };
}

function makeOutput<TInput, TOutput, TOptions>(
  outputCreator: OutputCreator<TInput, TOutput, TOptions>,
  input: Input<TInput>,
  options: TOptions,
): Output<any> {
  let output: Output<TOutput> | Observable<TOutput> = outputCreator(
    input,
    options as any,
  );

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

function makeViews(
  input,
  output,
  viewCreators?: ViewCreators,
): ViewComponentClasses<ViewCreators> {
  let views = {};

  if (viewCreators) {
    views = Object.keys(viewCreators).reduce(
      (views, name) => ({
        ...views,
        [name]: viewCreators[name](input, output),
      }),
      {},
    ) as any;
  }

  if (Object.keys(views).length === 0) {
    views = {
      View: view.passthrough()(input, output),
      ActionView: view.passthrough(true, false)(input, output),
      DataView: view.passthrough(false, true)(input, output),
    };
  }

  return views;
}
