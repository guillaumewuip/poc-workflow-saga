import { delay, isDelayEffect, run as runDelayEffect } from '../effects/delay';
import { call, isCallEffect, run as runCallEffect } from '../effects/call';

import { run } from './run';
import { Process } from './Process';

function* test(): Process {
  const delayResult = yield* delay(1000);
  console.log({ delayResult });

  yield* call((a: object) => {
    console.log(a);
    return a;
  }, { inCall: 'hello' });

  try {
    yield* call(() => {
      throw new Error('csoucou');
    });
  } catch (error) {
    console.error({ inCallError: error });
  }

  const promiseCallResult = yield* call((n: number, b: string) => new Promise<{n: number, b: string}>((resolve) => {
    setTimeout(() => {
      resolve({
        n,
        b
      });
    }, 1000);
  }), 1234, 'aaaa');

  console.log({ promiseCallResult });

  try {
    yield* call(() => new Promise((_, reject) => {
      setTimeout(() => {
        reject(1234);
      }, 1000);
    }));
  } catch (error) {
    console.error({ promiseCallError: error });
  }

  const result = yield* call(function* () {
    yield* delay(1000);

    return 'hello';
  });

  console.log('hello ?', { result });
}

run([
  {
    is: isDelayEffect,
    run: runDelayEffect,
  },
  {
    is: isCallEffect,
    run: runCallEffect,
  }
])(
  {},
  test,
);
