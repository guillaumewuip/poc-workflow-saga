import { Effects } from './Effect';

export type Process = Generator<Effects, void, unknown>;
