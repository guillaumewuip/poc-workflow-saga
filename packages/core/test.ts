import { delay, isDelayEffect, run as runDelayEffect } from '../effects/delay';
import { call, isCallEffect, run as runCallEffect } from '../effects/call';
import { fork, isForkEffect, run as runForkEffect } from '../effects/fork';
import { join, isJoinEffect, run as runJoinEffect } from '../effects/join';

import { Effects }  from './Effect'
import { run } from './run';
import { Process } from './Process';

function* subProcess1(): Generator<Effects, string, unknown> {
  yield* delay(2000);

  const message = 'hello world from subProcess 1';
  console.log({ message });

  return message
}

function* subProcess2(): Generator<Effects, string, unknown> {
  yield* delay(1000);

  const message = 'hello world from subProcess 2';
  console.log({ message });

  return message
}

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

  const task1 = yield* fork(subProcess1);
  const task2 = yield* fork(subProcess2);

  const tasksResult = yield* join([task1, task2]);

  console.log('join done', { tasksResult });
}

run([
  {
    is: isDelayEffect,
    run: runDelayEffect,
  },
  {
    is: isCallEffect,
    run: runCallEffect,
  },
  {
    is: isForkEffect,
    run: runForkEffect,
  },
  {
    is: isJoinEffect,
    run: runJoinEffect,
  }
])(
  {},
  test,
);
