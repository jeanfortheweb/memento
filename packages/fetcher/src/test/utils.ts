import { TaskSubject, Task, State } from '@memento/store';
import { Record } from 'immutable';
import { Observable, AjaxResponse, AjaxError } from '@reactivex/rxjs';
import createFetcher, { request, Request } from '../';

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
      return Observable.of(response);
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
  configuration: Request<TState>,
  response: Partial<AjaxResponse>,
  expectedTasks: any[],
) =>
  new Promise(resolve => {
    const task$ = new TaskSubject<TState>();
    const fetcher$ = createFetcher<TState>(
      Math.random() * 20 > 5 ? { headers: { 'Content-Type': 'text/html' } } : undefined,
    )(task$, null as any);
    const subscription = fetcher$.subscribe({
      next: value => {
        if (typeof value !== 'function' && value.kind === '@FETCHER/NO_TRIGGER') {
          return;
        }

        task$.next(value as Task<TState>);

        const index = expectedTasks.findIndex(task => task && task.kind === (value as any).kind);

        if (index >= 0) {
          const expectedTask = expectedTasks.splice(index, 1)[0];
          expect(value).toMatchObject(expectedTask);
        }

        if (expectedTasks.length === 0) {
          subscription.unsubscribe();
          unmock();
          resolve();
        }
      },
    });

    mock(response);

    task$.next(
      request<TState>({
        ...configuration,
      }),
    );
  });
