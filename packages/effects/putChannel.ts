import { Channel } from '../channel/Channel';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectClass,
  createEffectRunError,
} from '../core/EffectClass';

import {
  Context,
} from '../core/context';

import {
  Effect,
} from '../core/Effect';

export const NAME = 'PutChannel';

export type PutChannelEffect = Effect<typeof NAME> & {
  readonly event: unknown;
  readonly channel: Channel<unknown>;
}

function isPutChannelEffect(anyEffect: Effect<unknown>): anyEffect is PutChannelEffect {
  return anyEffect._NAME === NAME;
};

function create(event: unknown, channel: Channel<unknown>): PutChannelEffect {
  return {
    _NAME: NAME,
    event,
    channel,
  };
}

function run(
  effect: PutChannelEffect,
  _: Context,
  __: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    event,
    channel,
  } = effect;

  try {
    channel.put(event);
    next(createEffectRunValue(undefined));
  } catch (error) {
    next(createEffectRunError(error));
  }
}

export const effectClass = createEffectClass(isPutChannelEffect, run);

export function* putChannel<Event>(event: Event, channel: Channel<Event>) {
  const result = yield create(event, channel);

  // we are sure this is a number
  return result as undefined;
};
