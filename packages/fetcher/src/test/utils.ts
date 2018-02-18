import { TaskSubject, Task, State } from '@memento/store';
import { Record } from 'immutable';
import { Observable, AjaxResponse, AjaxError } from '@reactivex/rxjs';
import createFetcher, { request, Request, abort } from '../';

export interface FetcherStateProps {
  html: string;
}

export class FetcherState extends Record<FetcherStateProps>({
  html: '',
}) {}

const mock = (mock: Partial<AjaxResponse>) => {
  (Observable as any)._ajax = Observable.ajax;
  (Observable.ajax as any) = jest.fn((request): Observable<AjaxResponse> => {
    const response = {
      request,
      status: 200,
      responseType: 'json',
      xhr: null as any,
      originalEvent: null as any,
      ...(mock as AjaxResponse),
    };

    if (200 <= response.status && response.status < 300) {
      return Observable.of(response).delay(100);
    }

    return Observable.throw(
      new AjaxError('ajax error ' + response.status, request.createXHR(), request),
    );
  });
};

const unmock = () => {
  (Observable as any).ajax = (Observable as any)._ajax;
};

export const run = <TState extends State>(
  configuration: Request,
  response: Partial<AjaxResponse>,
  expectedTasks: any[],
  doAbort?: boolean,
) =>
  new Promise(resolve => {
    const task$ = new TaskSubject();
    const fetcher$ = createFetcher<TState>()(task$, null as any);
    const subscription = fetcher$.subscribe({
      next: value => {
        task$.next(value as Task);

        const index = expectedTasks.findIndex(task => task && task.kind === (value as any).kind);
        const expectedTask = expectedTasks.splice(index, 1)[0];

        expect(value).toMatchObject(expectedTask);

        if (expectedTasks.length === 0) {
          subscription.unsubscribe();
          unmock();
          resolve();
        }
      },
    });

    mock(response);

    task$.next(
      request({
        ...configuration,
      }),
    );

    if (doAbort) {
      task$.next(abort('foo'));
    }
  });
