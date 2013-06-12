(function (definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition();
    } else {
        this.aye = definition();
    }
})(function () {
    var aye = {};

    var isPromiseLike = function (obj) {
        return obj !== null
            && typeof obj === "object"
            && typeof obj.isPending === "function"
            && typeof obj.then === "function";
    };

    var doChainCall = function (defer, func, value) {
        var returnValue;
        try {
            returnValue = func(value);
        } catch (e) {
            defer.reject(e);
            return;
        }
        defer.resolve(returnValue);
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
            result,
            error,
            callbacks = [];

        var doFulfill = function (value) {
            pending = false;
            fulfilled = true;
            result = value;

            callbacks.forEach(function (link) {
                link.callFulfilled(result);
            });
        };

        var doReject = function (value) {
            pending = false;
            fulfilled = false;
            error = value;

            callbacks.forEach(function (link) {
                link.callRejected(error);
            });
        };

        var registerResultHandler = function (onFulfilled, onRejected) {
            var link = callChainLink(onFulfilled, onRejected);

            callbacks.push(link);

            if (!pending) {
                if (fulfilled) {
                    link.callFulfilled(result);
                } else {
                    link.callRejected(error);
                }
            }
            return link.promise;
        };

        return {
            resolve: function (value) {
                if (isPromiseLike(value)) {
                    value.then(function (theResult) {
                        doFulfill(theResult);
                    }, function (theResult) {
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
                    } else if (fulfilled) {
                        return result;
                    } else {
                        return {
                            exception: error
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

    return aye;
});
