import { totoBundle, TotoEffect } from '../effect/Effect';

import { run } from './run';

function* test(): Generator<TotoEffect, void, unknown> {
  yield totoBundle.create();
}

run(
  {},
  test,
  [
    totoBundle,
  ],
);
