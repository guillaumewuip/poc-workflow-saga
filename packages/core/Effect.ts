export interface Effect<NAME extends string> {
  readonly _NAME: NAME;
}

export interface EffectNameToEffect {};

export type NAMES = keyof EffectNameToEffect;

export type EffectFromName<NAME extends NAMES> = NAME extends NAMES ? EffectNameToEffect[NAME] : any;

export type Effects = EffectNameToEffect[NAMES];
