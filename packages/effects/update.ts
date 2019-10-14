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

export const NAME = 'Update';

type Store<S> = {
  updateState(updater: (s: S) => S): void;
}

export type UpdateEffect = Effect<typeof NAME> & {
  readonly storeGetter: (env: unknown) => Store<unknown>;
  readonly updater: (store: unknown) => unknown;
}

function isUpdateEffect(anyEffect: Effect<unknown>): anyEffect is UpdateEffect {
  return anyEffect._NAME === NAME;
};

function create(
  storeGetter: (env: any) => any,
  updater: (store: any) => any,
): UpdateEffect {
  return {
    _NAME: NAME,
    storeGetter,
    updater
  };
}

function run(
  effect: UpdateEffect,
  _: Context,
  env: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    storeGetter,
    updater,
  } = effect;

  try {
    const store = pipe(
      env,
      storeGetter,
    );

    store.updateState(updater);

    next(createEffectRunValue(undefined));
  } catch (error) {
    next(createEffectRunError(error));
  }
}

export const effectClass = createEffectClass(isUpdateEffect, run);

export function* updatee<
  Env extends {},
  State,
>(
  storeGetter: (env: Env) => Store<State>,
  updater: (state: State) => State,
) {
  yield create(storeGetter, updater);

  return undefined;
};


export function createUpdateStoreEffect<Env extends {}, State>(
  storeGetter: (env: Env) => Store<State>,
) {
  const storeEffectClass = createEffectClass<UpdateEffect, Env>(isUpdateEffect, run)

  const update = function* update(
    updater: (state: State) => State,
  ) {
    yield create(storeGetter, updater);

    return undefined;
  }

  return {
    effectClass: storeEffectClass,
    update,
  }
}
