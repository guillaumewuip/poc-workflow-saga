import { DelayEffect, delay, isDelayEffect, run as runDelayEffect } from '../effects/delay';
import { CallEffect, call, isCallEffect, run as runCallEffect } from '../effects/call';
import { ForkEffect, fork, isForkEffect, run as runForkEffect } from '../effects/fork';
import { JoinEffect, join, isJoinEffect, run as runJoinEffect } from '../effects/join';
import { CancelEffect, isCancelEffect, run as runCancelEffect } from '../effects/cancel';

import { RunningTask } from '../task/Task';
import { run } from './run';

function* subProcess1() {
  yield* delay(2000);

  const message = 'hello world from subProcess 1';
  console.log({ message });

  return message
}

function* subProcess2() {
  yield* delay(1000);

  const message = 'hello world from subProcess 2';
  console.log({ message });

  return message
}

function* test() {
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

  console.log({ callResult: result });

  // const task1 = (yield* fork(subProcess1)) as RunningTask;
  // const task2 = (yield* fork(subProcess2)) as RunningTask;

  // yield* delay(100);
  // // yield* cancel([task1]);

  // console.log('icici');

  // // yield* delay(10000);

  // try {
  //   const tasksResult = yield* join([task1, task2]);
  //   console.log('join done', { tasksResult });
  // } catch (error) {
  //   console.error(error);
  // }
}

run([
  {
    effect: {} as DelayEffect,
    env: {},
    is: isDelayEffect,
    run: runDelayEffect,
  },
  {
    effect: {} as CallEffect,
    env: {},
    is: isCallEffect,
    run: runCallEffect,
  },
  {
    effect: {} as ForkEffect,
    env: {},
    is: isForkEffect,
    run: runForkEffect,
  },
  {
    effect: {} as JoinEffect,
    env: {},
    is: isJoinEffect,
    run: runJoinEffect,
  },
  {
    effect: {} as CancelEffect,
    env: {} as { toto: string },
    is: isCancelEffect,
    run: runCancelEffect,
  },
])(
  {
    toto: 'hlle',
  },
  test,
);
