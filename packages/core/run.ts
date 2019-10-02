import { AnyEffectClass, createEffectRunValue } from './EffectClass';

import { buildNextEffectRunner } from './runEffect';
import { Context } from './context';
import { Process } from './Process';

export function run<EffectClasses extends AnyEffectClass[]>(
  runners: EffectClasses,
) {
  return function(
    _: {},
    process: () => Process,
  ) {
    const generator = process();

    const runNextEffect = buildNextEffectRunner<unknown>(runners);

    const context: Context = {
      runEffect: runNextEffect,
    };

    runNextEffect(context, generator, createEffectRunValue(undefined));

    const task = {};
    return task;
  }
};
