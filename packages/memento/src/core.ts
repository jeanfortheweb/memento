import { Subject, Observable } from 'rxjs';
import { ComponentClass, ReactNode } from 'react';

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export type InputSet<T extends {}> = {
  [K in keyof T]: T[K] extends void ? Subject<{}> : Subject<T[K]>
};

export type OutputSet<T extends {}> = { [K in keyof T]: Observable<T[K]> };

export type OutputOrOutputSet<T> = T extends any[]
  ? Observable<T>
  : T extends { [key: string]: any } ? OutputSet<T> : Observable<T>;

export type ActionSet<TSet> = TSet extends null
  ? null
  : {
      [K in keyof TSet]: TSet[K] extends void
        ? () => void
        : (input: TSet[K]) => void
    };

export interface InputCreator<TInput = any, TOptions = null> {
  (options: Options<TOptions>): InputSet<TInput>;
}

export interface OutputCreator<TInput, TOutput, TOptions = null> {
  (input: InputSet<TInput>, options: Options<TOptions>): OutputOrOutputSet<
    TOutput
  >;
}

export type ViewCreatorSet<TSet extends {} = any> = {
  [K in keyof TSet]: ViewCreator
};

export type Options<TOptions> = TOptions extends null
  ? {}
  : { [K in keyof TOptions]: TOptions[K] };

export type DefaultViewCreatorSet<TInput, TOutput> = {
  View: ViewCreator<TInput, TOutput, TInput, TOutput>;
  ActionView: ViewCreator<TInput, null, TInput, null>;
  DataView: ViewCreator<null, TOutput, TInput, null>;
};

export interface ConfigurableModelCreator<
  TInput,
  TOutput,
  TOptions,
  TViewCreatorSet extends ViewCreatorSet
> {
  (options: Options<TOptions>): Model<TInput, TOutput, TViewCreatorSet>;
  <TLateViewCreatorSet extends ViewCreatorSet>(
    options: Options<TOptions>,
    lateViewCreatorSet?: TLateViewCreatorSet,
  ): Model<TInput, TOutput, TViewCreatorSet, TLateViewCreatorSet>;
}

export interface ModelCreator<
  TInput,
  TOutput,
  TViewCreatorSet extends ViewCreatorSet
> {
  (): Model<TInput, TOutput, TViewCreatorSet>;
  <TLateViewCreatorSet extends ViewCreatorSet>(
    options: null,
    lateViewCreatorSet?: TLateViewCreatorSet,
  ): Model<TInput, TOutput, TViewCreatorSet, TLateViewCreatorSet>;
}

export type Model<
  TInput extends {} = any,
  TOutput extends {} = any,
  TViewCreators extends ViewCreatorSet = any,
  TLateViewCreatorSet extends ViewCreatorSet = any
> = ViewClassSet<TViewCreators, TLateViewCreatorSet> & {
  readonly input: InputSet<TInput>;
  readonly output: OutputOrOutputSet<TOutput>;
};

export interface ActionCreator<
  TInput = {},
  TActions = {},
  TProps = any,
  TOptions = any
> {
  (
    input: InputSet<TInput>,
    props: Readonly<ViewCreatorProps<TProps>>,
    options: Readonly<TOptions> | {},
  ): ActionSet<TActions>;
}

export interface DataCreator<
  TOutput = {},
  TData = {},
  TProps = any,
  TOptions = any
> {
  (
    output: Readonly<OutputOrOutputSet<TOutput>>,
    props: Readonly<ViewCreatorProps<TProps>>,
    options: Readonly<TOptions> | {},
  ): OutputOrOutputSet<TData>;
}

export interface ViewCreator<
  TInput = any,
  TOutput = any,
  TActions = any,
  TData = any,
  TProps = any,
  TOptions = any
> {
  (
    input: InputSet<TInput>,
    output: OutputOrOutputSet<TOutput>,
    options: Options<TOptions>,
  ): ComponentClass<ViewProps<TActions, TData> & ViewCreatorProps<TProps>>;
}

export type ViewCreatorProps<P> = P extends null
  ? null
  : { [K in keyof P]: P[K] };

export type ViewProps<TActions = null, TData = null> = {
  children?(
    actions: Readonly<ActionSet<TActions>>,
    data: Readonly<TData>,
  ): ReactNode;
};

export interface ViewState<TActions, TData> {
  actions: Readonly<ActionSet<TActions>>;
  data: Readonly<TData>;
  observable: Readonly<Observable<TData>>;
}

export type ViewClassSet<
  TViewCreators extends ViewCreatorSet<TViewCreators>,
  TLateViewCreators extends ViewCreatorSet<TLateViewCreators>
> = BaseViewClassSet<TViewCreators, TLateViewCreators> &
  LateViewClassSet<TViewCreators, TLateViewCreators>;

export type BaseViewClassSet<
  TViewCreators extends ViewCreatorSet,
  TLateViewCreators extends ViewCreatorSet
> = {
  [K in keyof Omit<TViewCreators, keyof TLateViewCreators>]: ReturnType<
    TViewCreators[K]
  >
};

export type LateViewClassSet<
  TViewCreators extends ViewCreatorSet,
  TLateViewCreators extends ViewCreatorSet
> = {
  [K in keyof Omit<
    TLateViewCreators,
    keyof TViewCreators
  >]: K extends keyof TViewCreators ? never : ReturnType<TLateViewCreators[K]>
};

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

export interface Connector<TModelA extends Model, TModelB extends Model> {
  (modelA: TModelA, modelB: TModelB, plug: Plugger): void;
}
