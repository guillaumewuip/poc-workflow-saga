import { Effect, EffectBundle } from '../effect/Effect';

export function run<E extends Effect, Return>(
  context: {},
  process: () => Generator<E, Return, unknown>,
  runners: EffectBundle<E>[]
) {
  const iterator = process();

  function nextEffect(arg: any) {
    const effect = iterator.next(arg);

    console.log(effect);

    if (effect.done) {

    } else {
      const validRunners = runners.filter(
        (runner) => runner.name === effect.value.name,
      );

      console.log({ runners, validRunners });

      if (validRunners.length) {
        validRunners[0].run(effect.value, context, nextEffect);
      }
    }


  }

  nextEffect(undefined);

  const task = {};
  return task;
}
