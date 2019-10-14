import { pipe } from 'fp-ts/lib/pipeable';

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

export const NAME = 'Select';

export type SelectEffect = Effect<typeof NAME> & {
  readonly storeGetter: (env: unknown) => unknown;
  readonly selector: (store: unknown) => unknown;
}

function isSelectEffect(anyEffect: Effect<unknown>): anyEffect is SelectEffect {
  return anyEffect._NAME === NAME;
};

function create(
  storeGetter: (env: any) => any,
  selector: (store: any) => any,
): SelectEffect {
  return {
    _NAME: NAME,
    storeGetter,
    selector,
  };
}

function run(
  effect: SelectEffect,
  _: Context,
  env: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    storeGetter,
    selector,
  } = effect;

  try {
    const selection = pipe(
      env,
      storeGetter,
      selector
    );

    next(createEffectRunValue(selection));
  } catch (error) {
    next(createEffectRunError(error));
  }
}

export const effectClass = createEffectClass(isSelectEffect, run);

export function* select<
  Env extends {},
  Store,
  Result,
>(
  storeGetter: (env: Env) => Store,
  selector: (store: Store) => Result,
) {
  const result = yield create(storeGetter, selector);

  // we are sure this is a Result
  return result as Result;
};


export function createSelectStoreEffect<Env extends {}, Store extends { getState: () => any }>(
  storeGetter: (env: Env) => Store,
) {
  const storeEffectClass = createEffectClass<SelectEffect, Env>(isSelectEffect, run)

  const select = function* select<Result>(
    selector: (store: Store) => Result,
  ) {
    const result = yield create((env) => storeGetter(env).getState(), selector);

    // we are sure this is a Result
    return result as Result;
  }

  return {
    effectClass: storeEffectClass,
    select,
  }
}
