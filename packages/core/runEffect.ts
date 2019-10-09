import { pipe } from 'fp-ts/lib/pipeable';
import { fold as foldEither } from 'fp-ts/lib/Either';
import { findFirst } from 'fp-ts/lib/Array';
import { fold as foldOption } from 'fp-ts/lib/Option';

import { isCancelled, isAborted } from '../task/Task';

import {
  Context,
} from './context';

import { AnyEffectClass, EffectRunResult, EnvFromClasses } from './EffectClass';

import { Effect } from './Effect';

export function buildNextEffectRunner<
  EffectClasses extends AnyEffectClass[],
>(
  runners: EffectClasses,
  env: EnvFromClasses<EffectClasses>,
) {
  return function runNextEffect<Return>(
    context: Context,
    generator: Generator<Effect, Return, unknown>,
    effectResult: EffectRunResult,
    onDone: (result: Return) => void,
  ) {
    // console.log({ effectResult });
    const {
      currentTask,
    } = context;

    // if current task is cancelled or aborted
    if (isCancelled(currentTask) || isAborted(currentTask)) {
      console.log('cancelled', { currentTask });
      // this will jump in the finaly block of the generator
      if (generator.return) {
        generator.return({} as Return);
      }

      return;
    }

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
              env,
              (result: EffectRunResult) => runNextEffect(context, generator, result, onDone),
            );
          },
        ),
      );

    }
  }
};
