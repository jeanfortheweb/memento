import { Worker, State, Task, Updater } from '@memento/store';

export interface UpdateStateTask<TStateProps> extends Task<State<TStateProps>> {
  kind: '@STATE_UPDATER/STATE_UPDATE';
  data: Partial<TStateProps>;
}

export interface StateWorkerTask {}

export const updateState = <TStateProps extends Object>(
  data: Partial<TStateProps>,
): UpdateStateTask<TStateProps> => ({
  kind: '@STATE_UPDATER/STATE_UPDATE',
  data,
});

export const createStateUpdater = <TStateProps extends Object>(): Worker<
  State<TStateProps>
> => task$ =>
  task$
    .accept<UpdateStateTask<TStateProps>>('@STATE_UPDATER/STATE_UPDATE')
    .map<UpdateStateTask<TStateProps>, Updater<State<TStateProps>>>(task => state =>
      state.merge(task.data),
    );
