import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';

import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';

import { MonoTypeOperatorFunction, TeardownLogic } from '../types';

export function takeDuring<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new TakeDuringOperator(notifier));
}

class TakeDuringOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    const takeUntilSubscriber = new TakeDuringSubscriber(subscriber);
    const notifierSubscription = subscribeToResult(takeUntilSubscriber, this.notifier);
    if (notifierSubscription && !notifierSubscription.closed) {
      takeUntilSubscriber.add(notifierSubscription);
      return source.subscribe(takeUntilSubscriber);
    }
    return takeUntilSubscriber;
  }
}

class TakeDuringSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>, ) {
    super(destination);
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    // noop.
  }

  notifyComplete(): void {
    this.complete();
  }

  notifyError(): void {
    this.complete();
  }
}
