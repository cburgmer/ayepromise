var ayepromise = require('../ayepromise.js');

module.exports = {
    pending: function () {
        var defer = ayepromise.defer();
        return {
            promise: defer.promise,
            fulfill: defer.resolve,
            reject: defer.reject
        };
    }
};
