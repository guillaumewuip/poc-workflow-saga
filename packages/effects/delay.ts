import {
  EffectRunResult,
  createEffectRunValue,
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

// declare module '../core/Effect' {
//   interface EffectNameToEffect {
//     Delay: DelayEffect;
//   }
// }

export function isDelayEffect(anyEffect: Effect): anyEffect is DelayEffect {
  return anyEffect._NAME === NAME;
};

function create(ms: number): DelayEffect {
  return {
    _NAME: NAME,
    delay: ms,
  };
}

export function run(
  effect: DelayEffect,
  _: Context,
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

export function* delay(ms: number) {
  const result = yield create(ms);

  // we are sure this is a number
  return result as number;
};
