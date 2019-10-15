import { Channel } from '../channel/Channel';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectClass,
} from '../core/EffectClass';

import {
  Context,
} from '../core/context';

import {
  Effect,
} from '../core/Effect';

export const NAME = 'TakeChannel';

export type TakeChannelEffect = Effect<typeof NAME> & {
  readonly channel: Channel<unknown>;
}

function isTakeChannelEffect(anyEffect: Effect<unknown>): anyEffect is TakeChannelEffect {
  return anyEffect._NAME === NAME;
};

function create(channel: Channel<unknown>): TakeChannelEffect {
  return {
    _NAME: NAME,
    channel,
  };
}

function run(
  effect: TakeChannelEffect,
  _: Context,
  __: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    channel,
  } = effect;


  const unsubscribe = channel.subscribe((event) => {
    next(createEffectRunValue(event));
    console.log({ unsubscribe });
    unsubscribe();
  });
}

export const effectClass = createEffectClass(isTakeChannelEffect, run);

export function* takeChannel<Event>(channel: Channel<Event>) {
  const result = yield create(channel);

  // we are sure this is a number
  return result as Event;
};
