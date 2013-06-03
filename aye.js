window.aye = (function () {
    var aye = {};

    aye.defer = function () {
        var pending = true;

        return {
            resolve: function () {
                pending = false;
            },
            promise: {
                isPending: function () {
                    return pending;
                }
            }
        };
    };

    return aye;
}());
