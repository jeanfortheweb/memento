import { Worker, State, Task, Updater } from '@memento/store';

export interface UpdateStateTask<TState extends State<TStateProps>, TStateProps>
  extends Task<TState> {
  kind: '@STATE_UPDATER/STATE_UPDATE';
  data: Partial<TStateProps>;
}

export const updateState = <TState extends State<TStateProps>, TStateProps extends Object>(
  data: Partial<TStateProps>,
): UpdateStateTask<TState, TStateProps> => ({
  kind: '@STATE_UPDATER/STATE_UPDATE',
  data,
});

export const createStateUpdater = <
  TState extends State<TStateProps>,
  TStateProps extends Object
>(): Worker<TState> => task$ =>
  task$
    .accept<UpdateStateTask<TState, TStateProps>>('@STATE_UPDATER/STATE_UPDATE')
    .map<UpdateStateTask<TState, TStateProps>, Updater<TState>>(task => state =>
      state.merge(task.data),
    );
