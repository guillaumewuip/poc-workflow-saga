import { pipe } from 'fp-ts/lib/pipeable';
import { identity } from 'fp-ts/lib/function';

import { EffectFromClasses, AnyEffectClass, EnvFromClasses, createEffectRunValue } from './EffectClass';

import { buildNextEffectRunner } from './runEffect';
import { Context } from './context';

import { createTask, fold, done, Task } from '../task/Task';

export function run<
  Classes extends AnyEffectClass[],
>(
  process: () => Generator<EffectFromClasses<Classes>, unknown, unknown>,
) {
  return function<
    Cs extends Classes,
    Env extends EnvFromClasses<Classes>
  >(
    classes: Cs,
    env: Env,
  ) {
    const generator = process();

    const runNextEffect = buildNextEffectRunner(classes, env);

    const task = createTask();
    const context: Context = {
      runEffect: runNextEffect,
      rootTask: task,
      currentTask: task,
    };

    try {
      runNextEffect(
        context,
        generator,
        createEffectRunValue(undefined),
        (result: unknown) => {
          console.log('process done', { result});
          // on done, we set the task to done
          pipe(
            task,
            fold<Task<unknown>, unknown>(done(result), identity, identity, identity)
          )
        },
      );
    } catch (error) {
      console.error(error);
      // abort task
      throw error;
    }

    return task;
  }
};
