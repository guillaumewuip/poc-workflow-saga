import {
  Effect,
  Effects,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectRunError,
} from '../core/EffectClass';

import { Context } from '../core/context';

const isPromise = (something: any): something is Promise<unknown> => {
  return something && typeof something.then === 'function';
}

const isGenerator = (something: any): something is Generator<Effects, unknown, unknown> => {
  return something && typeof something.next === 'function' && typeof something.throw === 'function';
};

export const NAME: 'CALL' = 'CALL';

export type CallEffect = Effect<typeof NAME> & {
  fn: (...args: any[]) => any
  args: any[],
};

declare module '../core/Effect' {
  interface EffectNameToEffect {
    Call: CallEffect;
  }
}

export function isCallEffect(anyEffect: Effects): anyEffect is CallEffect {
  return anyEffect._NAME === NAME;
};

function create<Fn extends (...args: any[]) => any>(fn: Fn, ...args: Parameters<Fn>): CallEffect {
  return {
    _NAME: NAME,
    fn,
    args,
  };
}

function runPromise(
  promise: Promise<unknown>,
  next: (result: EffectRunResult) => void,
) {
 promise
    .then((value) => {
      next(createEffectRunValue(value));
    })
    .catch((error) => {
      next(createEffectRunError(error));
    });
}

function runGenerator(
  generator: Generator<Effects, unknown, unknown>,
  context: Context,
  _: (result: EffectRunResult) => void,
) {
  context.runEffect(context, generator, createEffectRunValue(undefined));
}

export function run(
  effect: CallEffect,
  context: Context,
  next: (result: EffectRunResult) => void,
) {
  const {
    fn,
    args,
  } = effect;

  try {
    const result = fn.apply(undefined, args); // TODO fn context

    if (isPromise(result)) {
      runPromise(result, next);
    } else if (isGenerator(result)) {
      runGenerator(result, context, next);
    } else {
      next(createEffectRunValue(result));
    }
  } catch (error) {
    next(createEffectRunError(error));
  }
}

export function* call<Fn extends (...args: any[]) => any>(fn: Fn, ...args: Parameters<Fn>) {
  const result = yield create(fn, ...args);

  // we are sure result is ReturnType<Fn>
  return result as ReturnType<Fn>;
}
