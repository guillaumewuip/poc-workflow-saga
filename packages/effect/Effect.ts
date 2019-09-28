export type Effect = {
  _return: any,
  name: string;
};

type EffectReturnType<E extends Effect> = E['_return'];
type EffectName<E extends Effect> = E['name'];

type EffectCreator<Effect> = (...args: any[]) => Effect;
type EffectRunner<Effect> = (
  effect: Effect,
  context: {},
  next: (result: EffectReturnType<TotoEffect>) => void
) => any;

export type EffectBundle<E extends Effect> = {
  name: EffectName<E>,
  create: EffectCreator<E>
  run: EffectRunner<E>,
};

///


export type TotoEffect = Effect & {
  _return: string,
  name: 'TOTO',
};

const totoEffect: EffectCreator<TotoEffect> = () => ({
  name: 'TOTO',
}) as TotoEffect;

const runTotoEffect: EffectRunner<TotoEffect> = (
  effect,
  context: {},
  next,
) => {
  console.log({effect, context});
  next('toto');
}

export const totoBundle: EffectBundle<TotoEffect> = {
  name: 'TOTO',
  create: totoEffect,
  run: runTotoEffect,
};
