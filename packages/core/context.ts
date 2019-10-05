import { Effects } from './Effect';
import { EffectRunResult } from './EffectClass';

export type RunEffect = <R>(
  context: Context,
  generator: Generator<Effects, R, unknown>,
  effectResult: EffectRunResult,
  onDone: (result: R) => void,
) => void;

export type Context = {
  runEffect: RunEffect,
};

