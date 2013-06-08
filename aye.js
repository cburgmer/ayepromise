window.aye = (function () {
    var aye = {};

    var isPromiseLike = function (obj) {
        return typeof obj === "object"
            && typeof obj.isPending === "function"
            && typeof obj.then === "function";
    };

    var callChainLink = function (func) {
        var defer = aye.defer();
        return {
            promise: defer.promise,
            call: function (value) {
                var returnValue = func(value);
                if (isPromiseLike(returnValue)) {
                    returnValue.then(function (result) {
                        defer.resolve(result);
                    });
                } else {
                    defer.resolve(returnValue);
                }
            }
        }
    };

    aye.defer = function () {
        var pending = true,
            fulfilled,
            result = null,
            thenCallbacks = [],
            failCallbacks = [];

        return {
            resolve: function (value) {
                pending = false;
                fulfilled = true;
                result = value;

                thenCallbacks.forEach(function (link) {
                    link.call(result);
                });
            },
            reject: function (value) {
                pending = false;
                fulfilled = false;
                result = {
                    exception: value
                }

                failCallbacks.forEach(function (link) {
                    link.call(value);
                });
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

                    thenCallbacks.push(link);

                    if (!pending && fulfilled) {
                        link.call(result);
                    }
                    return link.promise;
                },
                fail: function (callback) {
                    var link = callChainLink(callback);

                    failCallbacks.push(link);

                    if (!pending && !fulfilled) {
                        link.call(result);
                    }
                    return link.promise;
                }
            }
        };
    };

    return aye;
}());
