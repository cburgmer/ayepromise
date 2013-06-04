window.aye = (function () {
    var aye = {};

    aye.defer = function () {
        var pending = true,
            result = null,
            thenCallbacks = [];

        return {
            resolve: function (value) {
                pending = false;
                result = value;

                thenCallbacks.forEach(function (callback) {
                    callback(result);
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
                    thenCallbacks.push(callback);

                    if (!pending) {
                        callback(result);
                    }
                }
            }
        };
    };

    return aye;
}());
