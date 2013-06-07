window.aye = (function () {
    var aye = {};

    var isPromiseLike = function (obj) {
        return typeof obj === "object"
            && typeof obj.isPending === "function"
            && typeof obj.then === "function"
            && typeof obj.valueOf === "function";
    };

    var callChainLink = function (func) {
        var defer = aye.defer();
        return {
            promise: defer.promise,
            call: function (value) {
                var returnValue = func(value);
                if (isPromiseLike(returnValue) && returnValue.isPending()) {
                    returnValue.then(function () {
                        defer.resolve(returnValue.valueOf());
                    });
                } else {
                    defer.resolve(returnValue);
                }
            }
        }
    };

    aye.defer = function () {
        var pending = true,
            result = null,
            downstreamLinks = [];

        return {
            resolve: function (value) {
                pending = false;
                result = value;

                downstreamLinks.forEach(function (link) {
                    link.call(result);
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

                    downstreamLinks.push(link);

                    if (!pending) {
                        link.call(result);
                    }
                    return link.promise;
                }
            }
        };
    };

    return aye;
}());
