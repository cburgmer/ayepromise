window.aye = (function () {
    var aye = {};

    aye.defer = function () {
        var pending = true,
            result = null,
            downstream = [];

        var doChainCall = function (downstreamElement) {
            downstreamElement.defer.resolve(downstreamElement.callback(result));
        };

        return {
            resolve: function (value) {
                pending = false;
                result = value;

                downstream.forEach(function (downstreamElement) {
                    doChainCall(downstreamElement);
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
                    var downstreamElement = {
                        defer: aye.defer(),
                        callback: callback
                    };

                    downstream.push(downstreamElement);

                    if (!pending) {
                        doChainCall(downstreamElement);
                    }
                    return downstreamElement.defer.promise;
                }
            }
        };
    };

    return aye;
}());
