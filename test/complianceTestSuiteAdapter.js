var aye = require('../aye.js');

module.exports = {
    pending: function () {
        var defer = aye.defer();
        return {
            promise: defer.promise,
            fulfill: defer.resolve,
            reject: defer.reject
        };
    }
};
