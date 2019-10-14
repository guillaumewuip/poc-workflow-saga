import { pipe } from 'fp-ts/lib/pipeable';
import { map } from 'fp-ts/lib/Array';
import { identity } from 'fp-ts/lib/function';

import {
  Effect,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectClass,
} from '../core/EffectClass';

import {
  Task,
  fold,
  cancel as cancelTask,
} from '../task/Task';

import { Context } from '../core/context';

export const NAME: 'CANCEL' = 'CANCEL';

export type CancelEffect = Effect<typeof NAME> & {
  tasks: Task<unknown>[],
};

function isCancelEffect(anyEffect: Effect<unknown>): anyEffect is CancelEffect {
  return anyEffect._NAME === NAME;
};

function create(tasks: Task<unknown>[]): CancelEffect {
  return {
    _NAME: NAME,
    tasks
  };
}

function run(
  effect: CancelEffect,
  _: Context,
  __: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    tasks,
  } = effect;

  pipe(
    tasks,
    map(
      fold<Task<unknown>, unknown>(
        cancelTask,
        identity,
        identity,
        identity,
      )
    )
  );

  next(createEffectRunValue(true));
}

export const effectClass = createEffectClass(isCancelEffect, run);

export function* cancel(tasks: Task<unknown>[]) {
  const result = yield create(tasks);

  return result as true;
}
