import {pipe} from 'fp-ts/lib/pipeable';
import {identity} from 'fp-ts/lib/function';
import { mapWithIndex, findFirst } from 'fp-ts/lib/Array';
import { fromArray, NonEmptyArray, map } from 'fp-ts/lib/NonEmptyArray';
import { Option, Some, none, some, isNone, option, fold as foldOption } from 'fp-ts/lib/Option';
import { sequenceT } from 'fp-ts/lib/Apply';
import { IO, io } from 'fp-ts/lib/IO';

import {
  Effect,
  Effects,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectRunError,
} from '../core/EffectClass';

import {
  Task,
  DoneTask,
  fold,
  result,
  cancel,
} from '../task/Task';

import { Context } from '../core/context';

export const NAME: 'JOIN' = 'JOIN';

export type JoinEffect = Effect<typeof NAME> & {
  tasks: Task<unknown>[],
};

declare module '../core/Effect' {
  interface EffectNameToEffect {
    Join: JoinEffect;
  }
}

export function isJoinEffect(anyEffect: Effects): anyEffect is JoinEffect {
  return anyEffect._NAME === NAME;
};

function create(tasks: Task<unknown>[]): JoinEffect {
  return {
    _NAME: NAME,
    tasks
  };
}

function allTaskDone(
  tasksDoneStatus: NonEmptyArray<Option<unknown>>
): tasksDoneStatus is NonEmptyArray<Some<unknown>> {
  const notDoneTask = findFirst(isNone)(tasksDoneStatus);

  // if no not done task, all task are done
  return isNone(notDoneTask);
}

export function run(
  effect: JoinEffect,
  context: Context,
  next: (result: EffectRunResult) => void,
) {
  const {
    tasks,
  } = effect;

  const {
    currentTask,
  } = context;

  const tasksDoneStatus: NonEmptyArray<Option<unknown>> = pipe(
    fromArray(tasks),
    // @ts-ignore
    foldOption(
      () => {
        const error = new Error('Join need at least one task');
        console.log(error);
        next(createEffectRunError(error));
      },
      identity,
    ),
    map(() => none),
  );

  const onSomeTaskDone = () => {
    if (allTaskDone(tasksDoneStatus)) {
      const arrayToOption = sequenceT(option);
      const maybeResult = arrayToOption(...tasksDoneStatus as [Some<any>]) as Some<[any]>;

      const results = pipe(
        maybeResult,
        foldOption(
          () => {
            const error = new Error('All tasks should be done at that point');
        console.log(error);
            next(createEffectRunError(error));
          },
          identity,
        ),
      );

      console.log({ results });

      // all task are done, we can terminate effect and return tasks results
      next(createEffectRunValue(results));
    }
  }

  console.log({ tasks });

  const taskListeners = pipe(
    tasks,
    mapWithIndex(
      (i, task): IO<void> => () => {
        task._eventEmitter.on('done', () => {
          const $task = task as DoneTask<unknown>;
          tasksDoneStatus[i] = some(result($task));
          // if all joined task are done, we're done
          onSomeTaskDone();
        })

        task._eventEmitter.on('cancelled', () => {
          // cancel current task
          pipe(
            currentTask,
            fold(
              cancel,
              identity,
              // @ts-ignore
              () => {
                // const e = new Error('Should not have to cancel aborted currentTask');
                console.log('qfdsjwfhj');
                return;
              },
              () => {
                // const e = new Error('Should not have to cancel done currentTask');
                console.log('qwfhj');
                return;
              },
            ),
          );
        });
        console.log({ i, task });
      }
    ),
  );

  const arrayToIO = sequenceT(io);
  const taskListener = arrayToIO(...taskListeners as [IO<unknown>]);
  taskListener();

  console.log('end join');
}

export function join<A>(tasks: [Task<A>]): Generator<Effects, [A], unknown>;
export function join<A, B>(tasks: [Task<A>, Task<B>]): Generator<Effects, [A, B], unknown>;
export function join<A, B, C>(tasks: [Task<A>, Task<B>, Task<C>]): Generator<Effects, [A, B, C], unknown>;
export function join<A, B, C, D>(tasks: [Task<A>, Task<B>, Task<C>, Task<D>]): Generator<Effects, [A, B, C, D], unknown>;
export function* join(tasks: Task<unknown>[]) {
  const result = yield create(tasks);

  return result;
}

