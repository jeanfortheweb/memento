import { State, Task, TaskObservable, StateObservable } from '@memento/store';
import { Observable } from '@reactivex/rxjs';

export const KIND_START = '@SUPERVISOR/TIMER/START';
export const KIND_STOP = '@SUPERVISOR/TIMER/STOP';

export type StartTimerTask = Task<
  typeof KIND_START,
  {
    name: string;
    initialDelay: number | undefined;
    period: number;
    creator: (tick: number, period: number, totalTime: number) => Task;
  }
>;

export type StopTimerTask = Task<typeof KIND_STOP, string>;

export const accept = <TState extends State>(
  task$: TaskObservable & Observable<Task>,
  state$: StateObservable<TState>,
) =>
  task$.accept(start).mergeMap(({ payload: { initialDelay, period, creator, name } }) =>
    Observable.timer(initialDelay, period)
      .map(tick => creator(tick, period, tick * period + (initialDelay || 0)))
      .takeUntil(task$.accept(stop).filter(task => task.payload === name)),
  );

export function stop(name: string): StopTimerTask {
  return {
    kind: KIND_STOP,
    payload: name,
  };
}

stop.toString = () => KIND_STOP;

export function start(
  name: string,
  initialDelay: number,
  period: number,
  creator: (tick: number, time: number, totalTime: number) => Task,
): StartTimerTask;

export function start(
  name: string,
  period: number,
  creator: (tick: number, time: number, totalTime: number) => Task,
): StartTimerTask;

export function start(): StartTimerTask {
  let name: string = arguments[0];
  let initialDelay!: number;
  let period: number;
  let creator: (tick: number, time: number, totalTime: number) => Task;

  if (arguments.length === 4) {
    initialDelay = arguments[1];
    period = arguments[2];
    creator = arguments[3];
  } else {
    period = arguments[1];
    creator = arguments[2];
  }

  return {
    kind: KIND_START,
    payload: {
      name,
      initialDelay,
      period,
      creator,
    },
  };
}

start.toString = () => KIND_START;

export default start;
