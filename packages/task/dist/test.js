"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
var function_1 = require("fp-ts/lib/function");
var Task_1 = require("./Task");
var task = Task_1.createTask();
task._eventEmitter.on('cancelled', function () { return console.log('task cancelled'); });
var child = Task_1.createTask();
if (Task_1.isRunning(child)) {
    pipeable_1.pipe(task, Task_1.fold(Task_1.addChild(child), function_1.identity, function_1.identity, function_1.identity));
}
child._tag = 'done';
pipeable_1.pipe(task, Task_1.fold(Task_1.setDoneIfChildrenAreDone, function_1.identity, function_1.identity, function_1.identity));
console.log({ task: task });
var cancelledTask = pipeable_1.pipe(task, Task_1.fold(Task_1.cancel, function_1.identity, function () { throw Error('no'); }, function () { throw Error('no'); }));
console.log(cancelledTask, cancelledTask === task);
//# sourceMappingURL=test.js.map