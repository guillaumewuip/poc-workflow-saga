import {Effect, EffectCreator, EffectRunner, EffectClass} from '../core/Effect';

const NAME: 'DELAY' = 'DELAY';

export type DelayEffect = Effect & {
  _return: string,
  name: typeof NAME,
  ms: number
};

const create: EffectCreator<DelayEffect> = (ms: number) => ({
  name: NAME,
  ms,
}) as DelayEffect;

const filter = (anyEffect: Effect): anyEffect is DelayEffect => {
  return anyEffect.name === NAME;
};

const run: EffectRunner<DelayEffect> = (
  effect,
  _: {},
  next,
) => {
  const {
    ms,
  } = effect;

  setTimeout(() => {
    next(ms);
  }, ms);
}

export const delayClass: EffectClass<DelayEffect> = {
  NAME,
  create,
  filter,
  run,
};

export const delay = create;
