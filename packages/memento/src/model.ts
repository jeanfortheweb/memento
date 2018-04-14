import { distinctUntilChanged } from 'rxjs/operators';
import { ReactNode } from 'react';
import {
  Actions,
  InputCreator,
  OutputCreator,
  ModelCreator,
  ViewCreators,
  DefaultViewCreators,
} from './core';
import { view } from '.';
import { Observable } from 'rxjs';

function defaultView(input, output) {
  const mapInputToActions = input =>
    Object.keys(input).reduce(
      (actions, name) => ({
        ...actions,
        [name]: value => input[name].next(value),
      }),
      {},
    );

  const mapOutputToData = output => output;

  return view(mapInputToActions, mapOutputToData)(input, output);
}

export interface ConnectProps<I extends {}, O extends {}> {
  children: (inputs: Actions<I>, outputs: O) => ReactNode;
}

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
  inputCreator: InputCreator<TInput, never>,
  outputCreator: OutputCreator<TInput, TOutput, never>,
): ModelCreator<TInput, TOutput, TOptions, TViewCreators>;

export default function model(inputCreator, outputCreator, viewCreators?) {
  return function create(options?) {
    const input = inputCreator(options as any);

    let output = outputCreator(input, options as any);
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
        View: defaultView(input, output),
      };
    }

    if (output instanceof Observable) {
      output = output.pipe(distinctUntilChanged());
    } else {
      output = Object.keys(output).reduce((mapped: any, name) => {
        let output$ = output[name].pipe(distinctUntilChanged());

        return {
          ...mapped,
          [name]: output$,
        };
      }, {});
    }

    return {
      input,
      output,
      ...(views as any),
    };
  };
}
