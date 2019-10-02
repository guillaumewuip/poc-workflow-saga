import {Either, right, left} from 'fp-ts/lib/Either';

import {
  Effects,
} from './Effect';

import {
  Context,
} from './context';

export type EffectRunResult = Either<EffectRunError, EffectRunValue>;
export type EffectRunError = {
  error: any;
};
export function createEffectRunError(error: any): EffectRunResult {
  return left({
    error,
  });
}

export type EffectRunValue = {
  value: any;
};
export function createEffectRunValue(value: any): EffectRunResult {
  return right({
    value,
  });
}

export type EffectRunner<Effect> = (
  effect: Effect,
  context: Context,
  next: (result: EffectRunResult) => void
) => any;

export type EffectClass<E extends Effects> = {
  is: (effect: Effects) => effect is E;
  run: (
    effect: E,
    _: Context,
    next: (result: EffectRunResult) => void,
  ) => void;
}

export type AnyEffectClass = EffectClass<any>;
