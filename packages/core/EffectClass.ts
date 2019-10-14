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

export type EffectFilter<
  E extends Effect<unknown>,
> = (effect: Effect<unknown>) => effect is E;

export type EffectRunner<
  E extends Effect<unknown>,
  Env extends {},
> = (
  effect: E,
  context: Context,
  env: Env,
  next: (result: EffectRunResult) => void
) => void;

export type EffectClass<
  E extends Effect<unknown>,
  Env,
> = {
  is: EffectFilter<E>;
  run: EffectRunner<E, Env>;
}

export function createEffectClass<
  E extends Effect<unknown>,
  Env extends {},
>(
  is: EffectFilter<E>,
  run: EffectRunner<E, Env>
): EffectClass<E, Env> {
  return {
    is,
    run,
  };
}

export type AnyEffectClass = {
  is: (effect: Effect<unknown>) => boolean;
  run: (
    effect: any,
    context: Context,
    env: any,
    next: (result: EffectRunResult) => void
  ) => void
};

export type EffectFromClass<C> = C extends EffectClass<infer E, any> ? E : never;
export type EffectFromClasses<Cs extends readonly AnyEffectClass[]> = EffectFromClass<Cs[number]>;

export type EnvFromClass<C> = C extends EffectClass<any, infer Env> ? Env: never;
export type EnvFromClasses<Cs extends readonly AnyEffectClass[]> = UnionToIntersection<EnvFromClass<Cs[number]>>;
