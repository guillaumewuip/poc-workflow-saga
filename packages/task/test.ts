import { pipe } from 'fp-ts/lib/pipeable';
import { identity } from 'fp-ts/lib/function';

import { Task, createTask, fold, cancel, addChild, isRunning, setDoneIfChildrenAreDone } from './Task';

const task = createTask();
task._eventEmitter.on('cancelled', () => console.log('task cancelled'));

const child = createTask();

if (isRunning(child)) {
  pipe(
    task,
    fold<Task<void>, void>(
      addChild(child),
      identity,
      identity,
      identity,
    ),
  );
}
child._tag = 'done';

pipe(
  task,
  fold<Task<void>, void>(
    setDoneIfChildrenAreDone,
    identity,
    identity,
    identity,
  ),
);


console.log({ task });


const cancelledTask = pipe(
  task,
  fold(
    cancel,
    identity,
    () => { throw Error('no') },
    () => { throw Error('no') },
  ),
);

console.log(cancelledTask, cancelledTask === task);
