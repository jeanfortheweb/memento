import { Task } from '../core';

export interface TaskCreator0<TKind extends string, TPayload> {
  (): Task<TKind, TPayload>;
}

export interface TaskCreator1<TKind extends string, TPayload, T1> {
  (arg1: T1): Task<TKind, TPayload>;
}

export interface TaskCreator2<TKind extends string, TPayload, T1, T2> {
  (arg1: T1, arg2: T2): Task<TKind, TPayload>;
}

export interface TaskCreator3<TKind extends string, TPayload, T1, T2, T3> {
  (arg1: T1, arg2: T2, arg3: T3): Task<TKind, TPayload>;
}

export interface TaskCreator4<TKind extends string, TPayload, T1, T2, T3, T4> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4): Task<TKind, TPayload>;
}

export interface TaskCreator5<TKind extends string, TPayload, T1, T2, T3, T4, T5> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): Task<TKind, TPayload>;
}

export function createTask<TKind extends string>(kind: TKind): TaskCreator0<TKind, any>;

export function createTask<TPayload, TKind extends string>(
  kind: TKind,
  factory: () => TPayload,
): TaskCreator0<TKind, TPayload>;

export function createTask<TPayload, TKind extends string, T1>(
  kind: TKind,
  factory: (arg1: T1) => TPayload,
): TaskCreator1<TKind, TPayload, T1>;

export function createTask<TPayload, TKind extends string, T1, T2>(
  kind: TKind,
  factory: (arg1: T1, arg2: T2) => TPayload,
): TaskCreator2<TKind, TPayload, T1, T2>;

export function createTask<TPayload, TKind extends string, T1, T2, T3>(
  kind: TKind,
  factory: (arg1: T1, arg2: T2, arg3: T3) => TPayload,
): TaskCreator3<TKind, TPayload, T1, T2, T3>;

export function createTask<TPayload, TKind extends string, T1, T2, T3, T4>(
  kind: TKind,
  factory: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TPayload,
): TaskCreator4<TKind, TPayload, T1, T2, T3, T4>;

export function createTask<TPayload, TKind extends string, T1, T2, T3, T4, T5>(
  kind: TKind,
  factory: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => TPayload,
): TaskCreator5<TKind, TPayload, T1, T2, T3, T4, T5>;

export function createTask(kind, factory?) {
  const creator: any = (...args) => ({ kind, payload: factory ? factory.apply(this, args) : {} });

  creator.toString = () => kind;

  return creator;
}
