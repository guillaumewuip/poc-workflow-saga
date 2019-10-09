import { pipe } from 'fp-ts/lib/pipeable';
import { map } from 'fp-ts/lib/Array';
import { identity } from 'fp-ts/lib/function';

import {
  Effect,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
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

// declare module '../core/Effect' {
//   interface EffectNameToEffect {
//     Cancel: CancelEffect;
//   }
// }

export function isCancelEffect(anyEffect: Effect): anyEffect is CancelEffect {
  return anyEffect._NAME === NAME;
};

function create(tasks: Task<unknown>[]): CancelEffect {
  return {
    _NAME: NAME,
    tasks
  };
}

export function run(
  effect: CancelEffect,
  _: Context,
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

export function* cancel(tasks: Task<unknown>[]) {
  const result = yield create(tasks);

  return result as true;
}

