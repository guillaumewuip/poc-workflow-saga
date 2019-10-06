import EventEmitter from 'eventemitter3';
import { map, snoc, findFirst }  from 'fp-ts/lib/Array';
import { identity } from 'fp-ts/lib/function';
import { isNone } from 'fp-ts/lib/Option';

type BaseTask = {
  _eventEmitter: EventEmitter<Events>,
};

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    Task: Task<A>;
  }
}
export type RunningTask = BaseTask & {
  _tag: 'running';
  _children: (RunningTask | CancelledTask | DoneTask<unknown>)[],
}

export type CancelledTask = BaseTask & {
  _tag: 'cancelled';
  _children: (CancelledTask | DoneTask<unknown>)[],
}

export type AbortedTask = BaseTask & {
  _tag: 'aborted';
  _children: (AbortedTask | DoneTask<unknown>)[],
}

export type DoneTask<R> = BaseTask & {
  _tag: 'done';
  _children: DoneTask<unknown>[],
  _result: R,
}

export type Task<R> = RunningTask | CancelledTask | AbortedTask | DoneTask<R>;

type Events = 'cancelled' | 'aborted' | 'done';

export function createTask<R = void>(): Task<R> {
  const eventEmitter = new EventEmitter<Events>();

  return {
    _tag: 'running',
    _children: [],
    _eventEmitter: eventEmitter,
  };
}

export function fold<R, Rd>(
  onRunning: (task: RunningTask) => R,
  onCancelled: (task: CancelledTask) => R,
  onAborted: (task: AbortedTask) => R,
  onDone: (task: DoneTask<Rd>) => R,
) {
  return (task: Task<Rd>) => {
    switch (task._tag) {
      case 'running':
        return onRunning(task);
      case 'cancelled':
        return onCancelled(task);
      case 'aborted':
        return onAborted(task);
      case 'done':
        return onDone(task);
    }
  }
}

export function isRunning<R>(task: Task<R>): task is RunningTask {
  return task._tag === 'running';
}

export function isCancelled<R>(task: Task<R>): task is CancelledTask {
  return task._tag === 'cancelled';
}

export function isAborted<R>(task: Task<R>): task is AbortedTask {
  return task._tag === 'aborted';
}

export function isDone<R>(task: Task<R>): task is DoneTask<R> {
  return task._tag === 'done';
}

export function cancel(task: RunningTask): CancelledTask {
  const $task = task as unknown as CancelledTask;

  $task._tag = 'cancelled';
  $task._children = map(
    fold<CancelledTask | DoneTask<unknown>, unknown>(
      cancel,
      () => { throw Error('no') },
      () => { throw Error('no') },
      identity,
    ),
  )($task._children);

  task._eventEmitter.emit('cancelled');

  return $task;
}

function areChildrenDone<R>(task: Task<R>) {
  if (isDone(task)) {
    return true;
  }

  const notDoneChild = findFirst((child: Task<unknown>) => !isDone(child))(task._children)

  return isNone(notDoneChild);
}

export function setDoneIfChildrenAreDone<R>(task: RunningTask): RunningTask | DoneTask<R> {
  if (areChildrenDone(task)) {
    const $task = task as unknown as DoneTask<R>;
    $task._tag = 'done';

    $task._eventEmitter.emit('done');
  }

  return task;
}

export function addChild(child: RunningTask) {
  return function(task: RunningTask) {
    child._eventEmitter.on('done', () => {
      // remove from children
      setDoneIfChildrenAreDone(task);
    });

    child._eventEmitter.on('cancelled', () => {
      // remove from children
    });

    task._children = snoc(task._children, child);

    return task;
  }
}

export function done<R>(result: R) {
  return function(task: RunningTask): DoneTask<R> {
    const $task = task as unknown as DoneTask<R>;
    $task._result = result;

    $task._eventEmitter.emit('done');

    return $task;
  }
}

export function result<R>(task: DoneTask<R>) {
  return task._result;
}
