import {pipe} from 'fp-ts/lib/pipeable';
import {identity} from 'fp-ts/lib/function';

import {
  Effect,
  Effects,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
} from '../core/EffectClass';

import {
  Task,
  RunningTask,
  createTask,
  done,
  fold,
  addChild,
} from '../task/Task';

import { Context } from '../core/context';

export const NAME: 'FORK' = 'FORK';

export type ForkEffect = Effect<typeof NAME> & {
  fn: (...args: any[]) => Generator<Effects, unknown, unknown>,
  args: any[],
};

declare module '../core/Effect' {
  interface EffectNameToEffect {
    Fork: ForkEffect;
  }
}

export function isForkEffect(anyEffect: Effects): anyEffect is ForkEffect {
  return anyEffect._NAME === NAME;
};

function create<
  Fn extends (...args: any[]) => Generator<Effects, unknown, unknown>
>(fn: Fn, ...args: Parameters<Fn>): ForkEffect {
  return {
    _NAME: NAME,
    fn,
    args,
  };
}
function runGenerator(
  generator: Generator<Effects, unknown, unknown>,
  context: Context,
  task: Task<unknown>,
) {
  context.runEffect(
    context,
    generator,
    createEffectRunValue(undefined),
    (result: unknown) => {
      console.log('doooooone', { result });
      pipe(
        task,
        fold<Task<unknown>, unknown>(
          done(result),
          identity,
          identity,
          identity,
        ),
      );
    },
  );
}

export function run(
  effect: ForkEffect,
  context: Context,
  next: (result: EffectRunResult) => void,
) {
  const {
    fn,
    args,
  } = effect;

  const {
    currentTask,
  } = context;

  const task = createTask<unknown>();

  pipe(
    currentTask,
    fold<Task<unknown>, unknown>(
      // we know it's running because nobody can change the task for now
      addChild(task as RunningTask),
      () => {
        throw new Error('Cannot add child task on cancelled task');
      },
      () => {
        throw new Error('Cannot add child task on aborted task');
      },
      () => {
        throw new Error('Cannot add child task on done task');
      },
    ),
  );

  const childContext: Context = {
    ...context,
    currentTask: task,
  };

  try {
    const generator = fn.apply(undefined, args);
    runGenerator(generator, childContext, task);

    next(createEffectRunValue(task));
  } catch (error) {
    // abort task
    throw error;
  }
}

type GeneratorResult<G> = G extends Generator<any, infer U, any> ? U : any;

export function* fork<
  Fn extends (...args: any[]) => Generator<Effects, unknown, unknown>
>(fn: Fn, ...args: Parameters<Fn>) {
  const result = yield create(fn, ...args);

  // we know create returns a task
  return result as Task<GeneratorResult<ReturnType<Fn>>>;
}
