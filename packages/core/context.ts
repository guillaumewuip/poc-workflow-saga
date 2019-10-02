import { Effects } from './Effect';
import { EffectRunResult } from './EffectClass';

export type RunEffect = (
  context: Context,
  generator: Generator<Effects, unknown, unknown>,
  effectResult: EffectRunResult,
) => void;

export type Context = {
  runEffect: RunEffect,
};

