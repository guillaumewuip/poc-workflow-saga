import { Effect, EffectClass } from './Effect';

export function run<E extends Effect, Return>(
  context: {},
  process: () => Generator<E, Return, unknown>,
  runners: EffectClass<E>[]
) {
  const iterator = process();

  function nextEffect(arg: any) {
    const effect = iterator.next(arg);

    console.log(effect);

    if (effect.done) {
      // ?
    } else {
      runners.forEach((runner) => {
        if (runner.filter(effect.value)) {
          runner.run(effect.value, context, nextEffect);
        }
      });
    }
  }

  nextEffect(undefined);

  const task = {};
  return task;
}
