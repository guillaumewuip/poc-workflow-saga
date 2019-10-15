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

export const NAME = 'Take';

export type TakeChannelEffect = Effect<typeof NAME> & {};

function isTakeChannelEffect(anyEffect: Effect<unknown>): anyEffect is TakeChannelEffect {
  return anyEffect._NAME === NAME;
};

function create(): TakeChannelEffect {
  return {
    _NAME: NAME,
  };
}

function run(
  _: TakeChannelEffect,
  __: Context,
  env: {
    channel: Channel<unknown>
  },
  next: (result: EffectRunResult) => void,
) {
  const {
    channel,
  } = env;

  const unsubscribe = channel.subscribe((event) => {
    next(createEffectRunValue(event));
    unsubscribe();
  });
}

export const createTakeEffect = <Event>() => {
  const effectClass = createEffectClass(isTakeChannelEffect, run);

  function* take() {
    const result = yield create();

    // we are sure this is a number
    return result as Event;
  };

  return {
    effectClass,
    take,
  }
}

