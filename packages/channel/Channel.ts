import {unsafeDeleteAt, snoc, head, findIndex} from 'fp-ts/lib/Array';
import {fold} from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/pipeable';

type Subscription<Event = any> = (event: Event) => void;
type Unsubscribe = () => void;

export type Channel<Event = any> = {
  put(event: Event): void;
  subscribe(subscribe: Subscription): Unsubscribe;
};

export function createUnicastChannel<Event>(): Channel<Event> {
  let buffer: Event[] = [];
  let subscriptions: Subscription<Event>[] = [];

  const put = (event: Event) => {
    const maybeSubscription = head(subscriptions);

    pipe(
      maybeSubscription,
      fold(
        () => {
          buffer = snoc(buffer, event);
        },
        (subscription) => {
          subscription(event);
        }
      )
    );
  };

  const subscribe = (subscription: Subscription) => {
    subscriptions = snoc(subscriptions, subscription);

    const maybeEvent = head(buffer);

    // ugly but for now we need to return the unsubscribe method before calling
    // the subscription
    // TODO make better
    setTimeout(() => {
      pipe(
        maybeEvent,
        fold(
          () => {},
          (event) => {
            buffer = unsafeDeleteAt(0, buffer)
            subscription(event);
          }
        ),
      );
    }, 0);

    return () => {
      const maybeIndex = findIndex((s: Subscription) => s === subscription)(subscriptions);

      pipe(
        maybeIndex,
        fold(
          () => {},
          (index) => {
            subscriptions = unsafeDeleteAt(index, subscriptions);
          }
        ),
      );
    };
  };

  return {
    put,
    subscribe,
  };
}

export function put<Event>(event: Event, channel: Channel<Event>): void {
  channel.put(event);
}

export function subscribe<Event>(
  subscription: (event: Event) => void,
  channel: Channel<Event>,
): Unsubscribe {
  return channel.subscribe(subscription);
}
