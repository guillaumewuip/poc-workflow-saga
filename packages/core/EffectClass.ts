import {Either, right, left} from 'fp-ts/lib/Either';

import {
  Effect,
} from './Effect';

import {
  Context,
} from './context';


type UnionToIntersection<U> = (
  U extends any
    ? (k: U) => void
    : never
) extends (
  (k: infer I) => void
)
  ? I
  : never;

export type EffectRunResult = Either<EffectRunError, EffectRunValue>;
export type EffectRunError = {
  error: any;
};
export function createEffectRunError(error: any): EffectRunResult {
  return left({
    error,
  });
}

export type EffectRunValue = {
  value: any;
};
export function createEffectRunValue(value: any): EffectRunResult {
  return right({
    value,
  });
}

export type EffectRunner<E extends Effect, Env extends {}> = (
  effect: E,
  context: Context,
  env: Env,
  next: (result: EffectRunResult) => void
) => void;

export type EffectClass<E extends Effect, Env extends {}> = {
  effect: E,
  env: Env,
  is: (effect: Effect) => effect is E;
  run: EffectRunner<E, Env>;
}

export type AnyEffectClass = EffectClass<any, any>;

export type EffectFromClass<C extends AnyEffectClass> = C['effect'];
export type EffectFromClasses<Cs extends AnyEffectClass[]> = Cs[number]['effect'];

export type EnvFromClass<C extends AnyEffectClass> = C['env'];
export type EnvFromClasses<Cs extends AnyEffectClass[]> = UnionToIntersection<Cs[number]['env']>;
