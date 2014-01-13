// UMD header
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.ayepromise = factory();
    }
}(this, function () {
    'use strict';

    var ayepromise = {};

    /* Wrap an arbitrary number of functions and allow only one of them to be
       executed and only once */
    var once = function () {
        var wasCalled = false;

        return function wrapper(wrappedFunction) {
            return function () {
                if (wasCalled) {
                    return;
                }
                wasCalled = true;
                wrappedFunction.apply(null, arguments);
            };
        };
    };

    var getThenableIfExists = function (obj) {
        // Make sure we only access the accessor once
        var then = obj && obj.then;

        if (obj !== null &&
            typeof obj === "object" &&
            typeof then === "function") {

            return then.bind(obj);
        }
    };

    var doChainCall = function (defer, func, value) {
        setTimeout(function () {
            var returnValue;
            try {
                returnValue = func(value);
            } catch (e) {
                defer.reject(e);
                return;
            }

            if (returnValue === defer.promise) {
                defer.reject(new TypeError('Cannot resolve promise with itself'));
            } else {
                defer.resolve(returnValue);
            }
        }, 1);
    };

    var doFulfillCall = function (defer, onFulfilled, value) {
        if (onFulfilled && onFulfilled.call) {
            doChainCall(defer, onFulfilled, value);
        } else {
            defer.resolve(value);
        }
    };

    var doRejectCall = function (defer, onRejected, value) {
        if (onRejected && onRejected.call) {
            doChainCall(defer, onRejected, value);
        } else {
            defer.reject(value);
        }
    };

    var aCallChainLink = function (onFulfilled, onRejected) {
        var defer = ayepromise.defer();
        return {
            promise: defer.promise,
            callFulfilled: function (value) {
                doFulfillCall(defer, onFulfilled, value);
            },
            callRejected: function (value) {
                doRejectCall(defer, onRejected, value);
            }
        };
    };

    // States
    var PENDING = 0,
        FULFILLED = 1,
        REJECTED = 2;

    ayepromise.defer = function () {
        var state = PENDING,
            outcome,
            callbacks = [];

        var doFulfill = function (value) {
            state = FULFILLED;
            outcome = value;

            callbacks.forEach(function (link) {
                link.callFulfilled(outcome);
            });
        };

        var doReject = function (error) {
            state = REJECTED;
            outcome = error;

            callbacks.forEach(function (link) {
                link.callRejected(outcome);
            });
        };

        var executeResultHandlerDirectlyIfStateNotPendingAnymore = function (link) {
            if (state === FULFILLED) {
                link.callFulfilled(outcome);
            } else if (state === REJECTED) {
                link.callRejected(outcome);
            }
        };

        var registerResultHandler = function (onFulfilled, onRejected) {
            var link = aCallChainLink(onFulfilled, onRejected);

            callbacks.push(link);

            executeResultHandlerDirectlyIfStateNotPendingAnymore(link);

            return link.promise;
        };

        var safelyResolveThenable = function (thenable) {
            // Either fulfill, reject or reject with error
            var onceWrapper = once();
            try {
                thenable(
                    onceWrapper(transparentlyResolveThenablesAndFulfill),
                    onceWrapper(doReject)
                );
            } catch (e) {
                onceWrapper(doReject)(e);
            }
        };

        var transparentlyResolveThenablesAndFulfill = function (value) {
            var thenable;

            try {
                thenable = getThenableIfExists(value);
            } catch (e) {
                doReject(e);
                return;
            }

            if (thenable) {
                safelyResolveThenable(thenable);
            } else {
                doFulfill(value);
            }
        };

        var onceWrapper = once();
        return {
            resolve: onceWrapper(transparentlyResolveThenablesAndFulfill),
            reject: onceWrapper(doReject),
            promise: {
                then: registerResultHandler,
                fail: function (onRejected) {
                    return registerResultHandler(null, onRejected);
                }
            }
        };
    };

    return ayepromise;
}));
