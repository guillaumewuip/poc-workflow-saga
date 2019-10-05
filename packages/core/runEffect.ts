import { pipe } from 'fp-ts/lib/pipeable';
import { fold as foldEither } from 'fp-ts/lib/Either';
import { findFirst } from 'fp-ts/lib/Array';
import { fold as foldOption } from 'fp-ts/lib/Option';

import {
  Context,
} from './context';

import { AnyEffectClass, EffectRunResult}   from './EffectClass';

import { Effects } from './Effect';

export function buildNextEffectRunner(
  runners: AnyEffectClass[],
) {
  return function runNextEffect<Return>(
    context: Context,
    generator: Generator<Effects, Return, unknown>,
    effectResult: EffectRunResult,
    onDone: (result: Return) => void,
  ) {
    const result = pipe(
      effectResult,
      foldEither(
        (effectResult) => generator.throw(effectResult.error),
        (effectResult) => generator.next(effectResult.value),
      ),
    );

    if (result.done) {
      onDone(result.value);
    } else {
      const effect = result.value;
      const maybeRunner = findFirst((effectClass: AnyEffectClass) => effectClass.is(effect))(runners);

      pipe(
        maybeRunner,
        foldOption(
          () => {
            throw new Error(`No runner for effect ${effect._NAME}`);
          },
          (runner) => {
            runner.run(
              effect,
              context,
              (result: EffectRunResult) => runNextEffect(context, generator, result, onDone),
            );
          },
        ),
      );

    }
  }
};
