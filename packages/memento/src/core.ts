import { Subject, Observable } from 'rxjs';
import { ComponentClass, ReactNode } from 'react';

export type Input<T extends {}> = {
  [K in keyof T]: T[K] extends void ? Subject<{}> : Subject<T[K]>
};

export type Output<T extends {}> = T extends Observable<infer TData>
  ? Observable<TData>
  : { [K in keyof T]: Observable<T[K]> };

export type Actions<T extends {}> = {
  [K in keyof T]: T[K] extends void ? () => void : (input: T[K]) => void
};

export type Model<
  TInput extends {} = any,
  TOutput extends {} = any,
  TViewCreators extends ViewCreators = any
> = ViewComponentClasses<TViewCreators> & {
  readonly input: Input<TInput>;
  readonly output: Output<TOutput>;
};

export interface InputCreator<TInput = any, TOptions = never> {
  (options: TOptions): Input<TInput>;
}

export interface OutputCreator<TInput, TOutput, TOptions = never> {
  (input: Input<TInput>, options: TOptions): Output<TOutput>;
}

export interface ModelCreator<
  TInput,
  TOutput,
  TOptions,
  TViewCreators extends ViewCreators
> {
  (): Model<TInput, TOutput, TViewCreators>;
  (options: TOptions): Model<TInput, TOutput, TViewCreators>;
}

export interface MapInputToActions<TInput, TActions, TProps extends {} = {}> {
  (input: Input<TInput>, props: Readonly<TProps>): Actions<TActions>;
}

export interface MapOutputToData<TOutput, TData, TProps extends {} = {}> {
  (input: Output<TOutput>, props: Readonly<TProps>): Output<TData>;
}

export interface ViewProps<TActions, TData> {
  children(actions: TActions, data: TData): ReactNode;
}

export interface ViewState<TActions, TData> {
  actions: TActions;
  data: TData;
  data$: Observable<TData>;
}

export interface ViewCreator<
  TInput = any,
  TOutput = any,
  TActions = any,
  TData = any,
  TProps extends {} = any
> {
  (input: Input<TInput>, output: Output<TOutput>): ComponentClass<
    ViewProps<TActions, TData> & TProps
  >;
}

export type ViewCreators<TCreators extends {} = any> = {
  [K in keyof TCreators]: ViewCreator
};

export type DefaultViewCreators<TInput, TOutput> = ViewCreators<{
  View: ViewCreator<TInput, TOutput>;
}>;

export type ExtractActionType<
  TViewCreator extends ViewCreator
> = TViewCreator extends ViewCreator<any, any, infer TActions>
  ? Actions<TActions>
  : {};

export type ExtractDataType<
  TViewCreator extends ViewCreator
> = TViewCreator extends ViewCreator<any, any, any, infer TData> ? TData : {};

export type ExtractPropsType<
  TViewCreator extends ViewCreator
> = TViewCreator extends ViewCreator<any, any, any, any, infer TProps>
  ? TProps
  : {};

export type ExtractInputType<TModel extends Model> = TModel extends Model<
  infer TInput
>
  ? TInput extends Input<infer TInputType> ? TInputType : never
  : never;

export type ExtractOutputType<TModel extends Model> = TModel extends Model<
  any,
  infer TOutput
>
  ? TOutput extends Output<infer TOutputType> ? TOutputType : never
  : never;

export type ViewComponentClasses<TViewCreators extends ViewCreators> = {
  [K in keyof TViewCreators]: ComponentClass<
    ExtractPropsType<TViewCreators[K]> & {
      children(
        actions: ExtractActionType<TViewCreators[K]>,
        data: ExtractDataType<TViewCreators[K]>,
      ): ReactNode;
    }
  >
};

export interface Disconnect {
  (): void;
}

export type Merge<TInput, TOutput> = {
  [K in keyof TInput]: K extends keyof TOutput
    ? TOutput[K] extends TInput[K] ? TInput[K] : TOutput[K]
    : TInput[K]
};
