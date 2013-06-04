window.aye = (function () {
    var aye = {};

    var callChainLink = function (func) {
        var defer = aye.defer();
        return {
            promise: defer.promise,
            call: function (value) {
                defer.resolve(func(value));
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
                        throw new Error("Promise hasn't been resolved yet");
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
