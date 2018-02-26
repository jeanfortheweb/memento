import { Observable, Subject } from '@reactivex/rxjs';
import {
  Task,
  TaskObservable,
  createTask,
  TaskCreator1,
  TaskCreator2,
  TaskCreator0,
} from '@memento/store';

export const KIND_CONNECT = '@HOTLINE/CONNECT';
export const KIND_OPEN = '@HOTLINE/OPEN';
export const KIND_CLOSE = '@HOTLINE/CLOSE';
export const KIND_RECEIVED = '@HOTLINE/RECEIVED';
export const KIND_SEND = '@HOTLINE/SEND';
export const KIND_DISCONNECT = '@HOTLINE/DISCONNECT';

export interface ConnectPayload {
  url: string;
  name: string;
  tags: string[];
  protocol?: string | string[];
}

export interface SendPayload {
  name: string;
  message: any;
}

export interface ReceivePayload<T = any> {
  name: string;
  tags: string[];
  data: T;
}

export interface LifeCyclePayload {
  name: string;
  tags: string[];
  message?: string;
}

export type Send = TaskCreator1<typeof KIND_SEND, SendPayload, any> &
  TaskCreator2<typeof KIND_SEND, SendPayload, string, any>;

export type Connect = TaskCreator1<
  typeof KIND_CONNECT,
  ConnectPayload,
  string | Partial<ConnectPayload>
>;

export type Disconnect = TaskCreator0<typeof KIND_DISCONNECT, string> &
  TaskCreator1<typeof KIND_DISCONNECT, string, string>;

export type ConnectTask = Task<typeof KIND_CONNECT, ConnectPayload>;
export type OpenTask = Task<typeof KIND_OPEN, LifeCyclePayload>;
export type SendTask = Task<typeof KIND_SEND, SendPayload>;
export type ReceiveTask<T = any> = Task<typeof KIND_RECEIVED, ReceivePayload<T>>;
export type DisconnectTask = Task<typeof KIND_DISCONNECT, string | undefined>;
export type LifeCycleTask = Task<typeof KIND_OPEN | typeof KIND_CLOSE, LifeCyclePayload>;

export const connect: Connect = createTask(
  KIND_CONNECT,
  (urlOrConfiguration: string | Partial<ConnectPayload>): ConnectPayload => {
    if (typeof urlOrConfiguration === 'string') {
      return {
        name: 'default',
        tags: [],
        url: urlOrConfiguration,
      };
    }

    return {
      url: '',
      ...urlOrConfiguration,
      name: urlOrConfiguration.name || 'default',
      tags: urlOrConfiguration.tags || [],
    };
  },
);

export const open = createTask(KIND_OPEN, (payload: LifeCyclePayload) => payload);

export const close = createTask(KIND_CLOSE, (payload: LifeCyclePayload) => payload);

export const disconnect: Disconnect = createTask(
  KIND_DISCONNECT,
  (name?: string) => name || 'default',
);

export const receive = <T = any>(payload: ReceivePayload): ReceiveTask<T> => ({
  kind: KIND_RECEIVED,
  payload,
});

receive.toString = () => KIND_RECEIVED;

export const send: Send = createTask(KIND_SEND, (name: string, message?: string) => ({
  name: message ? name : 'default',
  message: message ? message : name,
}));

export default () => (
  task$: TaskObservable & Observable<Task>,
): Observable<Task<string, any>> => {
  const webSocket$ = task$.accept(connect).flatMap(task => {
    const { name, tags, url, protocol } = task.payload;

    const disconnect$ = task$
      .accept(disconnect)
      .filter(({ payload }) => payload === name);

    const send$ = task$
      .accept(send)
      .filter(({ payload }) => payload.name === name)
      .map(({ payload }) => JSON.stringify(payload.message));

    const openObserver$ = new Subject<Event>();
    const closeObserver$ = new Subject<CloseEvent>();

    const connection$ = Observable.webSocket({
      url,
      protocol,
      openObserver: openObserver$,
      closeObserver: closeObserver$,
    }).takeUntil(disconnect$) as Subject<string>;

    send$.subscribe(message => connection$.next(message));

    const open$ = openObserver$.mapTo(open({ name, tags }));
    const close$ = closeObserver$.mapTo(close({ name, tags }));
    const message$ = connection$.map(data => receive({ name, tags, data }));

    return Observable.merge(open$, close$, message$);
  });

  return webSocket$;
};
