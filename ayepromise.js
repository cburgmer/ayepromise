(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.ayepromise = factory();
  }
}(this, function () {
    var ayepromise = {};

    var getThenableIfExists = function (obj) {
        // make sure we only access the getter once
        var then = obj && obj.then;

        if (obj !== null &&
            typeof obj === "object" &&
            typeof then === "function") {

            return then;
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
            defer.resolve(returnValue);
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

    ayepromise.defer = function () {
        var pending = true,
            fulfilled,
            outcome,
            callbacks = [];

        var doFulfill = function (value) {
            pending = false;
            fulfilled = true;
            outcome = value;

            callbacks.forEach(function (link) {
                link.callFulfilled(outcome);
            });
        };

        var doReject = function (value) {
            pending = false;
            fulfilled = false;
            outcome = value;

            callbacks.forEach(function (link) {
                link.callRejected(outcome);
            });
        };

        var registerResultHandler = function (onFulfilled, onRejected) {
            var link = aCallChainLink(onFulfilled, onRejected);

            callbacks.push(link);

            if (!pending) {
                if (fulfilled) {
                    link.callFulfilled(outcome);
                } else {
                    link.callRejected(outcome);
                }
            }
            return link.promise;
        };

        return {
            resolve: function (value) {
                if (!pending) {
                    return;
                }

                var thenable = getThenableIfExists(value);
                if (thenable) {
                    thenable(doFulfill, doReject);
                } else {
                    doFulfill(value);
                }
            },
            reject: function (value) {
                if (!pending) {
                    return;
                }
                doReject(value);
            },
            promise: {
                isPending: function () {
                    return pending;
                },
                valueOf: function () {
                    if (pending) {
                        return this;
                    } else if (fulfilled) {
                        return outcome;
                    } else {
                        return {
                            exception: outcome
                        };
                    }
                },
                then: registerResultHandler,
                fail: function (onRejected) {
                    return registerResultHandler(null, onRejected);
                }
            }
        };
    };

    return ayepromise;
}));
