import { Subject, Observable } from 'rxjs';
import { ComponentClass, ReactNode } from 'react';

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export type InputSet<T extends {}> = {
  [K in keyof T]: T[K] extends void ? Subject<{}> : Subject<T[K]>
};

export type OutputSet<T extends {}> = { [K in keyof T]: Observable<T[K]> };

export type ObservableOrOutputSet<
  T extends {} | Observable<any>
> = T extends Observable<infer TData> ? Observable<TData> : OutputSet<T>;

export type ActionSet<T extends {}> = {
  [K in keyof T]: T[K] extends void ? () => void : (input: T[K]) => void
};

export interface InputCreator<TInput = any, TOptions = any> {
  (options: TOptions): InputSet<TInput>;
}

export interface OutputCreator<TInput, TOutput, TOptions = any> {
  (input: InputSet<TInput>, options: TOptions): ObservableOrOutputSet<TOutput>;
}

export type ViewCreatorSet<TSet extends {} = any> = {
  [K in keyof TSet]: ViewCreator
};

export type DefaultViewCreatorSet<TInput, TOutput> = {
  View: () => ComponentClass<ViewProps<ActionSet<TInput>, TOutput, {}>>;
  ActionView: () => ComponentClass<ViewProps<ActionSet<TInput>, never, {}>>;
  DataView: () => ComponentClass<ViewProps<never, TOutput, {}>>;
};

export interface ModelCreator<
  TInput,
  TOutput,
  TOptions,
  TViewCreatorSet extends ViewCreatorSet
> {
  (): Model<TInput, TOutput, TViewCreatorSet>;
  (options: TOptions): Model<TInput, TOutput, TViewCreatorSet, TViewCreatorSet>;
  <TLateViewCreatorSet extends ViewCreatorSet>(
    options: TOptions,
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
  readonly output: ObservableOrOutputSet<TOutput>;
};

export interface MapInputToActions<
  TInput,
  TActions,
  TProps extends {} = {},
  TOptions extends {} = any
> {
  (
    input: Readonly<InputSet<TInput>>,
    props: Readonly<TProps>,
    options: Readonly<TOptions>,
  ): ActionSet<TActions>;
}

export interface MapOutputToData<
  TOutput,
  TData,
  TProps extends {} = {},
  TOptions extends {} = any
> {
  (
    output: Readonly<ObservableOrOutputSet<TOutput>>,
    props: Readonly<TProps>,
    options: Readonly<TOptions>,
  ): ObservableOrOutputSet<TData>;
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
    input: InputSet<TInput>,
    output: ObservableOrOutputSet<TOutput>,
    options: TOptions,
  ): ComponentClass<ViewProps<ActionSet<TActions>, Readonly<TData>, TProps>>;
}

export type ViewCreatorProps<P> = { [K in keyof P]: P[K] };

export type ViewProps<TActions, TData, TProps> = ViewCreatorProps<TProps> & {
  children(actions: TActions, data: TData): ReactNode;
};

export interface ViewState<TActions, TData> {
  actions: TActions;
  data: TData;
  observable: Observable<TData>;
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
