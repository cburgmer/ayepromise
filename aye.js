window.aye = (function () {
    var aye = {};

    aye.defer = function () {
        var pending = true,
            result = null,
            thenCallback;

        return {
            resolve: function (value) {
                pending = false;
                result = value;

                if (thenCallback) {
                    thenCallback(result);
                }
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
                    thenCallback = callback;

                    if (!pending) {
                        thenCallback(result);
                    }
                }
            }
        };
    };

    return aye;
}());
