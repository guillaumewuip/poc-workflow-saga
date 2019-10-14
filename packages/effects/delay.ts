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

export const NAME = 'Delay';

export type DelayEffect = Effect<typeof NAME> & {
  readonly delay: number;
}

function isDelayEffect(anyEffect: Effect<unknown>): anyEffect is DelayEffect {
  return anyEffect._NAME === NAME;
};

function create(ms: number): DelayEffect {
  return {
    _NAME: NAME,
    delay: ms,
  };
}

function run(
  effect: DelayEffect,
  _: Context,
  __: unknown,
  next: (result: EffectRunResult) => void,
) {
  if (!isDelayEffect(effect)) {
    return;
  }

  const {
    delay: ms,
  } = effect;

  setTimeout(() => {
    next(createEffectRunValue(ms));
  }, ms);
}

export const effectClass = createEffectClass(isDelayEffect, run);

export function* delay(ms: number) {
  const result = yield create(ms);

  // we are sure this is a number
  return result as number;
};
