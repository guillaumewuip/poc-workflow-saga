import { Effect } from './Effect';
import { EffectRunResult } from './EffectClass';

import {
  Task
} from '../task/Task';

export type RunEffect = <R>(
  context: Context,
  generator: Generator<Effect<unknown>, R, unknown>,
  effectResult: EffectRunResult,
  onDone: (result: R) => void,
) => void;

export type Context = {
  readonly runEffect: RunEffect,
  readonly rootTask: Task<unknown>,
  readonly currentTask: Task<unknown>,
};

