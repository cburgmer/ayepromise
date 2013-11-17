var ayepromise = require('../ayepromise.js');

module.exports.deferred = function () {
    var defer = ayepromise.defer();
    return {
        promise: defer.promise,
        resolve: defer.resolve,
        reject: defer.reject
    };
};
