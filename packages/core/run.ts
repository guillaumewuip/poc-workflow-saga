import { AnyEffectClass, createEffectRunValue } from './EffectClass';

import { buildNextEffectRunner } from './runEffect';
import { Context } from './context';
import { Process } from './Process';

import { createTask } from '../task/Task';

export function run<EffectClasses extends AnyEffectClass[]>(
  runners: EffectClasses,
) {
  return function(
    _: {},
    process: () => Process,
  ) {
    const generator = process();

    const runNextEffect = buildNextEffectRunner(runners);

    const task = createTask();
    const context: Context = {
      runEffect: runNextEffect,
      rootTask: task,
      currentTask: task,
    };

    try {
      runNextEffect(context, generator, createEffectRunValue(undefined), () => {});
    } catch (error) {
      console.error(error);
      // abort task
      throw error;
    }

    return task;
  }
};
