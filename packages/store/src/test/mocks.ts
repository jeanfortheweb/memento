import { List, Record } from 'immutable';
import { Task } from '../core';

export interface StateProps {
  propertyA: string;
  propertyB: number;
  propertyC: List<boolean>;
  propertyD: SubState;
}

export interface SubStateProps {
  propertyA: string;
  propertyB: string;
}

export class SubState extends Record<SubStateProps>({
  propertyA: 'propertyA',
  propertyB: 'propertyB',
}) {}

export class State extends Record<StateProps>({
  propertyA: 'propertyA',
  propertyB: 0,
  propertyC: List([true, false]),
  propertyD: new SubState({
    propertyA: 'propertyA',
    propertyB: 'propertyB',
  }),
}) {}

export type TaskA = Task<
  '@TEST/TASK_A',
  {
    parameterA: string;
    parameterB: string;
  }
>;

export type TaskB = Task<
  '@TEST/TASK_B',
  {
    parameterA: number;
    parameterB: number;
  }
>;

export const taskA: TaskA = {
  kind: '@TEST/TASK_A',
  payload: {
    parameterA: 'parameterA',
    parameterB: 'parameterB',
  },
};

export const taskB: TaskB = {
  kind: '@TEST/TASK_B',
  payload: {
    parameterA: 0,
    parameterB: 1,
  },
};
