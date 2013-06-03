window.aye = (function () {
    var aye = {};

    aye.defer = function () {
        var pending = true,
            result = null;

        return {
            resolve: function (value) {
                pending = false;
                result = value;
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
                }
            }
        };
    };

    return aye;
}());
