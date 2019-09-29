export type Effect = {
  _return: any,
  name: string;
};

export type EffectReturnType<E extends Effect> = E['_return'];
export type EffectName<E extends Effect> = E['name'];

export type EffectCreator<E extends Effect> = (...args: any[]) => E;
export type EffectRunner<E extends Effect> = (
  effect: E,
  context: {},
  next: (result?: EffectReturnType<E>) => void
) => any;
export type EffectFilter<E extends Effect> = (anyEffect: Effect) => anyEffect is E;

export type EffectClass<E extends Effect> = {
  NAME: EffectName<E>,
  filter: EffectFilter<E>,
  create: EffectCreator<E>
  run: EffectRunner<E>,
};

