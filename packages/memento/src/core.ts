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

export interface InputCreator<TInput = any, TOptions = any> {
  (options: TOptions): Input<TInput>;
}

export interface OutputCreator<TInput, TOutput, TOptions = any> {
  (input: Input<TInput>, options: TOptions): Output<TOutput>;
}

export interface ViewsCreator<
  TViewCreators extends ViewCreators = any,
  TOptions = any
> {
  (options: TOptions): TViewCreators;
}

export type ViewCreators<TCreators extends {} = any> = {
  [K in keyof TCreators]: ViewCreator
};

export type DefaultViewCreators<TInput, TOutput> = {
  View: () => ComponentClass<ViewProps<Actions<TInput>, TOutput, {}>>;
  ActionView: () => ComponentClass<ViewProps<Actions<TInput>, never, {}>>;
  DataView: () => ComponentClass<ViewProps<never, TOutput, {}>>;
};

export interface ModelCreator<
  TInput,
  TOutput,
  TOptions,
  TViewCreators extends ViewCreators
> {
  (): Model<TInput, TOutput, TViewCreators>;
  (options: TOptions): Model<TInput, TOutput, TViewCreators>;
}

export type Model<
  TInput extends {} = any,
  TOutput extends {} = any,
  TViewCreators extends ViewCreators = any
> = ViewComponentClasses<TViewCreators> & {
  readonly input: Input<TInput>;
  readonly output: Output<TOutput>;
};

export interface MapInputToActions<
  TInput,
  TActions,
  TProps extends {} = {},
  TOptions extends {} = any
> {
  (
    input: Readonly<Input<TInput>>,
    props: Readonly<TProps>,
    options: Readonly<TOptions>,
  ): Actions<TActions>;
}

export interface MapOutputToData<
  TOutput,
  TData,
  TProps extends {} = {},
  TOptions extends {} = any
> {
  (
    output: Readonly<Output<TOutput>>,
    props: Readonly<TProps>,
    options: Readonly<TOptions>,
  ): Output<TData>;
}

export interface ViewCreator<
  TInput = any,
  TOutput = any,
  TActions = any,
  TData = any,
  TProps extends {} = {},
  TOptions extends {} = {}
> {
  (
    input: Input<TInput>,
    output: Output<TOutput>,
    options: TOptions,
  ): ComponentClass<ViewProps<Actions<TActions>, Readonly<TData>, TProps>>;
}

export type Props<P> = { [K in keyof P]: P[K] };

export type ViewProps<TActions, TData, TProps> = Props<TProps> & {
  children(actions: TActions, data: TData): ReactNode;
};

export interface ViewState<TActions, TData> {
  actions: TActions;
  data: TData;
  data$: Observable<TData>;
}

export type ViewComponentClasses<
  TViewCreators extends ViewCreators<TViewCreators>
> = { [K in keyof TViewCreators]: ReturnType<TViewCreators[K]> };

type a = ViewComponentClasses<
  ViewCreators<DefaultViewCreators<{ a: number }, { b: number }>>
>;

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

export interface Disconnect {
  (): void;
}

export type Merge<TInput, TOutput> = {
  [K in keyof TInput]: K extends keyof TOutput
    ? TOutput[K] extends TInput[K] ? TInput[K] : TOutput[K]
    : TInput[K]
};

export interface Plugger {
  <T>(output: Observable<T>, input: Subject<T>): void;
}

export interface ConnectCreator<TModelA extends Model, TModelB extends Model> {
  (modelA: TModelA, modelB: TModelB, plug: Plugger): void;
}
