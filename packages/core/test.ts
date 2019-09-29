import { delay, DelayEffect, delayClass } from '../effects/delay';

import { run } from './run';

function* test(): Generator<DelayEffect, void, unknown> {
  yield delay(1000);
  yield delay(2000);
  yield delay(4000);
}

run(
  {},
  test,
  [
    delayClass,
  ],
);
