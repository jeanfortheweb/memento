import { Task, Omit } from '../core';

export interface TaskCreatorMembers<TTask extends Task> {
  kind: TTask['kind'];
  toString: () => string;
}

export interface TaskCreator0<TTask extends Task> extends TaskCreatorMembers<TTask> {
  (): TTask;
}

export interface TaskCreator1<TTask extends Task, T1> extends TaskCreatorMembers<TTask> {
  (arg1: T1): TTask;
}

export interface TaskCreator2<TTask extends Task, T1, T2> extends TaskCreatorMembers<TTask> {
  (arg1: T1, arg2: T2): TTask;
}

export interface TaskCreator3<TTask extends Task, T1, T2, T3> extends TaskCreatorMembers<TTask> {
  (arg1: T1, arg2: T2, arg3: T3): TTask;
}

export interface TaskCreator4<TTask extends Task, T1, T2, T3, T4>
  extends TaskCreatorMembers<TTask> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4): TTask;
}

export interface TaskCreator5<TTask extends Task, T1, T2, T3, T4, T5>
  extends TaskCreatorMembers<TTask> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): TTask;
}

export interface TaskCreatorAny<TTask extends Task> extends TaskCreatorMembers<TTask> {
  (...args: any[]): TTask;
}

export interface TaskCreatorFactory0<TTask extends Task> {
  (): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactory1<TTask extends Task, T1> {
  (arg1: T1): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactory2<TTask extends Task, T1, T2> {
  (arg1: T1, arg2: T2): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactory3<TTask extends Task, T1, T2, T3> {
  (arg1: T1, arg2: T2, arg3: T3): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactory4<TTask extends Task, T1, T2, T3, T4> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactory5<TTask extends Task, T1, T2, T3, T4, T5> {
  (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): Omit<TTask, 'kind'>;
}

export interface TaskCreatorFactoryAny<TTask extends Task> {
  (...args: any[]): Omit<TTask, 'kind'>;
}

export function taskCreator<TTask extends Task>(
  kind: TTask['kind'],
  factory?: TaskCreatorFactory0<TTask>,
): TaskCreator0<TTask>;

export function taskCreator<TTask extends Task, T1>(
  kind: TTask['kind'],
  factory: TaskCreatorFactory1<TTask, T1>,
): TaskCreator1<TTask, T1>;

export function taskCreator<TTask extends Task, T1, T2>(
  kind: TTask['kind'],
  factory: TaskCreatorFactory2<TTask, T1, T2>,
): TaskCreator2<TTask, T1, T2>;

export function taskCreator<TTask extends Task, T1, T2, T3>(
  kind: TTask['kind'],
  factory: TaskCreatorFactory3<TTask, T1, T2, T3>,
): TaskCreator3<TTask, T1, T2, T3>;

export function taskCreator<TTask extends Task, T1, T2, T3, T4>(
  kind: TTask['kind'],
  factory: TaskCreatorFactory4<TTask, T1, T2, T3, T4>,
): TaskCreator4<TTask, T1, T2, T3, T4>;

export function taskCreator<TTask extends Task, T1, T2, T3, T4, T5>(
  kind: TTask['kind'],
  factory: TaskCreatorFactory5<TTask, T1, T2, T3, T4, T5>,
): TaskCreator5<TTask, T1, T2, T3, T4, T5>;

export function taskCreator<TTask extends Task>(
  kind: TTask['kind'],
  factory: TaskCreatorFactoryAny<TTask>,
): TaskCreatorAny<TTask>;

export function taskCreator<TTask extends Task>(
  kind: TTask['kind'],
  factory?: TaskCreatorFactoryAny<TTask>,
) {
  const creator: any = (...args) => ({ kind, ...(factory ? factory.apply(this, args) : {}) });

  creator.kind = kind;
  creator.toString = () => kind;

  return creator;
}

export default taskCreator;
