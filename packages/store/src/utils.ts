import { State, Task, Updater } from './core';

export const isUpdater = <TState extends State>(
  value: Updater<TState> | Task,
): value is Updater<TState> => typeof value === 'function';
