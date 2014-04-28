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
        // Make sure we only access the accessor once as required by the spec
        var then = obj && obj.then;

        if (typeof obj === "object" && typeof then === "function") {
            return function() { return then.apply(obj, arguments); };
        }
    };

    var aThenHandler = function (onFulfilled, onRejected) {
        var defer = ayepromise.defer();

        var doHandlerCall = function (func, value) {
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

        return {
            promise: defer.promise,
            fulfilled: function (value) {
                if (onFulfilled && onFulfilled.call) {
                    doHandlerCall(onFulfilled, value);
                } else {
                    defer.resolve(value);
                }
            },
            rejected: function (value) {
                if (onRejected && onRejected.call) {
                    doHandlerCall(onRejected, value);
                } else {
                    defer.reject(value);
                }
            }
        };
    };

    // States
    var PENDING = null,
        FULFILLED = "fulfilled",
        REJECTED = "rejected";

    ayepromise.defer = function () {
        var state = PENDING,
            outcome,
            thenHandlers = [];

        var doSettle = function (settledState, value) {
            state = settledState;
            outcome = value;

            thenHandlers.forEach(function (then) {
                then[state](outcome);
            });
            thenHandlers = null;
        };

        var doFulfill = function (value) { doSettle(FULFILLED, value); };
        var doReject = function (error) { doSettle(REJECTED, error); };

        var registerThenHandler = function (onFulfilled, onRejected) {
            var thenHandler = aThenHandler(onFulfilled, onRejected);

            if (state) {
                thenHandler[state](outcome);
            } else {
                thenHandlers.push(thenHandler);
            }

            return thenHandler.promise;
        };

        var safelyResolveThenable = function (thenable) {
            // Either fulfill, reject or reject with error
            var onceWrapper = once();
            try {
                thenable(
                    onceWrapper(transparentlyResolveThenablesAndSettle),
                    onceWrapper(doReject)
                );
            } catch (e) {
                onceWrapper(doReject)(e);
            }
        };

        var transparentlyResolveThenablesAndSettle = function (value) {
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
        function fail (onRejected) {
            return registerThenHandler(null, onRejected);
        }
        return {
            resolve: onceWrapper(transparentlyResolveThenablesAndSettle),
            reject: onceWrapper(doReject),
            promise: {
                then: registerThenHandler,
                fail: fail,
                "catch": fail
            }
        };
    };

    return ayepromise;
}));
