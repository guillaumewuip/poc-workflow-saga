import { pipe } from 'fp-ts/lib/pipeable';
import { sequenceT } from 'fp-ts/lib/Apply';
import * as Option from 'fp-ts/lib/Option';
import * as Arr from 'fp-ts/lib/Array';
import * as NonEmptyArray from 'fp-ts/lib/NonEmptyArray';
import * as Either from 'fp-ts/lib/Either';
import * as TaskEither from 'fp-ts/lib/TaskEither';
import * as TTask from 'fp-ts/lib/Task';

import {
  Effect,
} from '../core/Effect';

import {
  EffectRunResult,
  createEffectRunValue,
  createEffectRunError,
  createEffectClass,
} from '../core/EffectClass';

import {
  Task,
  RunningTask,
  DoneTask,
  result,
  isRunning,
  isDone,
} from '../task/Task';

import { Context } from '../core/context';

export const NAME: 'JOIN' = 'JOIN';

export type JoinEffect = Effect<typeof NAME> & {
  tasks: RunningOrDoneTask<unknown>[],
};

function isJoinEffect(anyEffect: Effect<unknown>): anyEffect is JoinEffect {
  return anyEffect._NAME === NAME;
};

function create(tasks: RunningOrDoneTask<unknown>[]): JoinEffect {
  return {
    _NAME: NAME,
    tasks
  };
}

function run(
  effect: JoinEffect,
  _: Context,
  __: unknown,
  next: (result: EffectRunResult) => void,
) {
  const {
    tasks,
  } = effect;

  // const {
  //   currentTask,
  // } = context;

  function validateTasks(tasks: Task<unknown>[]): Either.Either<Error, NonEmptyArray.NonEmptyArray<RunningOrDoneTask<unknown>>> {
    return pipe(
      tasks,
      Arr.findFirst(
        (task) => !isDone(task) && !isRunning(task)
      ),
      Option.fold(
        // all task are done or running
        () => {
          if (!tasks.length) {
            return Either.left(new Error('Join need at least one tasks'));
          }

          return Either.right(tasks as NonEmptyArray.NonEmptyArray<RunningOrDoneTask<unknown>>);
        },
        // at least one task is cancelled or aborted
        () => Either.left(new Error('Join only work on done or running tasks')),
      ),
    );
  };

  function watchTask(task: RunningOrDoneTask<unknown>): TaskEither.TaskEither<Error, unknown> {
    return () => new Promise((resolve) => {
      if (isDone(task)) {
        resolve(Either.right(result(task)));
      } else {
        task._eventEmitter.on('done', () => {
          const $task = task as unknown as DoneTask<unknown>;
          resolve(Either.right(result($task)));
        })

        task._eventEmitter.on('cancelled', () => {
          resolve(Either.left(new Error('joined task cancelled')));
        });
      }
    });

  }

  function watchTasks(
    tasks: NonEmptyArray.NonEmptyArray<RunningOrDoneTask<unknown>>
  ): NonEmptyArray.NonEmptyArray<TaskEither.TaskEither<Error, unknown>> {
    return pipe(
      tasks,
      NonEmptyArray.map(
        watchTask,
      ),
    );
  }

  function sequenceTaskEither(
    tasks: NonEmptyArray.NonEmptyArray<TaskEither.TaskEither<Error, unknown>>
  ): TaskEither.TaskEither<Error, NonEmptyArray.NonEmptyArray<unknown>> {
    const sequenceTaskEither = sequenceT(TaskEither.taskEither);

    return sequenceTaskEither(...tasks as [TaskEither.TaskEither<Error, unknown>]);
  }

  function toSimpleTask(e: Either.Either<Error, TaskEither.TaskEither<Error, NonEmptyArray.NonEmptyArray<unknown>>>) {
    return pipe(
      e,
      Either.fold(
        (error): TTask.Task<void> => () => new Promise((resolve) => {
          next(createEffectRunError(error));
          resolve();
        }),
        TaskEither.fold(
          (error): TTask.Task<void> => () => new Promise((resolve) => {
            next(createEffectRunError(error));
            resolve();
          }),
          (results): TTask.Task<void> => () => new Promise((resolve) => {
            next(createEffectRunValue(results));
            resolve();
          }),
        ),
      ),
    );
  }

  const process = pipe(
    tasks,
    validateTasks,
    Either.map(watchTasks),
    Either.map(sequenceTaskEither),
    toSimpleTask,
  );

  process();

  console.log('join process started');
}

export const effectClass = createEffectClass(isJoinEffect, run);

type RunningOrDoneTask<A> = RunningTask | DoneTask<A>;

export function join<A>(tasks: [RunningOrDoneTask<A>]): Generator<JoinEffect, [A], unknown>;
export function join<A, B>(tasks: [RunningOrDoneTask<A>, RunningOrDoneTask<B>]): Generator<JoinEffect, [A, B], unknown>;
export function join<A, B, C>(tasks: [RunningOrDoneTask<A>, RunningOrDoneTask<B>, RunningOrDoneTask<C>]): Generator<JoinEffect, [A, B, C], unknown>;
export function join<A, B, C, D>(tasks: [RunningOrDoneTask<A>, RunningOrDoneTask<B>, RunningOrDoneTask<C>, RunningOrDoneTask<D>]): Generator<JoinEffect, [A, B, C, D], unknown>;

export function* join(tasks: RunningOrDoneTask<unknown>[]) {
  const result = yield create(tasks);

  return result;
}

