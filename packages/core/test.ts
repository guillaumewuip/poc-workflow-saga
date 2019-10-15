import { delay, effectClass as delayEffectClass } from '../effects/delay';
import { call, effectClass as callEffectClass } from '../effects/call';
import { fork, effectClass as forkEffectClass } from '../effects/fork';
import { join, effectClass as joinEffectClass } from '../effects/join';
import { cancel, effectClass as cancelEffectClass } from '../effects/cancel';
import { select, effectClass as selectEffectClass, createSelectStoreEffect } from '../effects/select';
import { createUpdateStoreEffect } from '../effects/update';
import { takeChannel, effectClass as takeChannelEffectClass } from '../effects/takeChannel';
import { putChannel, effectClass as putChannelEffectClass } from '../effects/putChannel';

import { createUnicastChannel } from '../channel/Channel';
import { RunningTask } from '../task/Task';
import { run } from './run';

// ------------ fake store

type Store = {
  getState: () => string[],
  updateState: (updater: (messages: string[]) => string[]) => void
};

const messages: string[] = ['hello'];
const store: Store = {
  getState() {
    return messages;
  },

  updateState(updater: (messages: string[]) => string[]) {
    const newMessages = updater(messages);
    messages.splice(0, messages.length, ...newMessages);
  },
}

// ------------

// on crée des effets select / update spécialisé à un store qui se trouve sur la
// clé "store" de l'environnement
// Comme c'est quelque chose de super courant  ça vaudra le coup de déplacer ça
// dans ../effects/{select,update}Store histoire que ce ça ne soit pas à l'app
// de le faire
const selectEffect = createSelectStoreEffect(
  ({ store }: { store: Store }) => store,
);
const updateEffect = createUpdateStoreEffect(
  ({ store }: { store: Store }) => store,
);

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
  const valueFromGeneric = yield* select<{ someStore: { value: number }}, { value: number }, number>(
    ({ someStore }) => someStore,
    (store) => store.value,
  );

  console.log('generic select', { valueFromGeneric });

  yield* updateEffect.update(
    (messages) => [...messages, 'world'],
  );

  const messages = yield* selectEffect.select(
    (messages) => messages,
  );

  console.log('specialized select after update', { messages });

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

  // TODO  do not use as RunningTask but fold on task
  const task1 = (yield* fork(subProcess1)) as RunningTask;
  const task2 = (yield* fork(subProcess2)) as RunningTask;

  yield* delay(100);
  yield* cancel([task1]);

  console.log('icici');

  yield* delay(1000);

  try {
    const tasksResult = yield* join([task1, task2]);
    console.log('join done', { tasksResult });
  } catch (error) {
    console.error(error);
  }

  const channel = createUnicastChannel<string>();

  yield* putChannel('hello channel', channel);

  const channelOutpout = yield* takeChannel(channel);

  console.log({ channelOutpout });
}

const effectClasses = [
  delayEffectClass,
  callEffectClass,
  forkEffectClass,
  joinEffectClass,
  cancelEffectClass,
  selectEffectClass,
  selectEffect.effectClass,
  updateEffect.effectClass,
  takeChannelEffectClass,
  putChannelEffectClass,
];

const program = run<typeof effectClasses>(test);

program(effectClasses, {
  someStore: { value: 1234431 },
  store,
});
