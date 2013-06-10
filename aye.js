window.aye = (function () {
    var aye = {};

    var isPromiseLike = function (obj) {
        return typeof obj === "object"
            && typeof obj.isPending === "function"
            && typeof obj.then === "function"
            && typeof obj.fail === "function";
    };

    var doChainCall = function (defer, func, value) {
        try {
            var returnValue = func(value);
        } catch (e) {
            defer.reject(e);
            return;
        }
        if (isPromiseLike(returnValue)) {
            returnValue.then(function (result) {
                defer.resolve(result);
            });
            returnValue.fail(function (result) {
                defer.reject(result);
            });
        } else {
            defer.resolve(returnValue);
        }
    };

    var callChainLink = function (onFulfilled, onRejected) {
        var defer = aye.defer();
        return {
            promise: defer.promise,
            callFulfilled: function (value) {
                if (onFulfilled) {
                    doChainCall(defer, onFulfilled, value);
                } else {
                    defer.resolve()
                }
            },
            callRejected: function (value) {
                if (onRejected) {
                    doChainCall(defer, onRejected, value);
                } else {
                    defer.reject(value);
                }
            }
        }
    };

    aye.defer = function () {
        var pending = true,
            fulfilled,
            result = null,
            callbacks = [];

        var doFulfill = function (value) {
            pending = false;
            fulfilled = true;
            result = value;

            callbacks.forEach(function (link) {
                link.callFulfilled(value);
            });
        };

        var doReject = function (value) {
            pending = false;
            fulfilled = false;
            result = {
                exception: value
            }

            callbacks.forEach(function (link) {
                link.callRejected(value);
            });
        };

        return {
            resolve: function (value) {
                if (isPromiseLike(value)) {
                    value.then(function (theResult) {
                        doFulfill(theResult);
                    });
                    value.fail(function (theResult) {
                        doReject(theResult);
                    });
                } else {
                    doFulfill(value);
                }
            },
            reject: function (value) {
                doReject(value);
            },
            promise: {
                isPending: function () {
                    return pending;
                },
                valueOf: function () {
                    if (pending) {
                        return this;
                    }
                    return result;
                },
                then: function (callback) {
                    var link = callChainLink(callback);

                    callbacks.push(link);

                    if (!pending && fulfilled) {
                        link.callFulfilled(result);
                    }
                    return link.promise;
                },
                fail: function (callback) {
                    var link = callChainLink(null, callback);

                    callbacks.push(link);

                    if (!pending && !fulfilled) {
                        link.callRejected(result);
                    }
                    return link.promise;
                }
            }
        };
    };

    return aye;
}());
