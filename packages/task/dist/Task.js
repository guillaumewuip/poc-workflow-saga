"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventemitter3_1 = __importDefault(require("eventemitter3"));
var Array_1 = require("fp-ts/lib/Array");
var function_1 = require("fp-ts/lib/function");
var Option_1 = require("fp-ts/lib/Option");
function createTask() {
    var eventEmitter = new eventemitter3_1.default();
    return {
        _tag: 'running',
        _children: [],
        _eventEmitter: eventEmitter,
    };
}
exports.createTask = createTask;
function fold(onRunning, onCancelled, onAborted, onDone) {
    return function (task) {
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
    };
}
exports.fold = fold;
function isRunning(task) {
    return task._tag === 'running';
}
exports.isRunning = isRunning;
function isCancelled(task) {
    return task._tag === 'cancelled';
}
exports.isCancelled = isCancelled;
function isAborted(task) {
    return task._tag === 'aborted';
}
exports.isAborted = isAborted;
function isDone(task) {
    return task._tag === 'done';
}
exports.isDone = isDone;
function cancel(task) {
    var $task = task;
    $task._tag = 'cancelled';
    $task._children = Array_1.map(fold(cancel, function () { throw Error('no'); }, function () { throw Error('no'); }, function_1.identity))($task._children);
    task._eventEmitter.emit('cancelled');
    return $task;
}
exports.cancel = cancel;
function areChildrenDone(task) {
    if (isDone(task)) {
        return true;
    }
    var notDoneChild = Array_1.findFirst(function (child) { return !isDone(child); })(task._children);
    return Option_1.isNone(notDoneChild);
}
function setDoneIfChildrenAreDone(task) {
    if (areChildrenDone(task)) {
        var $task = task;
        $task._tag = 'done';
        $task._eventEmitter.emit('done');
    }
    return task;
}
exports.setDoneIfChildrenAreDone = setDoneIfChildrenAreDone;
function addChild(child) {
    return function (task) {
        child._eventEmitter.on('done', function () {
            setDoneIfChildrenAreDone(task);
        });
        task._children = Array_1.snoc(task._children, child);
        return task;
    };
}
exports.addChild = addChild;
//# sourceMappingURL=Task.js.map