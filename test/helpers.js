(function (definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition();
    } else {
        this.helpers = definition();
    }
})(function () {
    var helpers = {},
        subject;

    var alreadyResolved = function (testName, value, test) {
        var done = jasmine.createSpy("done");

        it(testName + " (already resolved)", function () {
            var defer = subject.defer();
            defer.resolve(value);
            test(defer.promise, done);

            waitsFor(function () {
                return done.wasCalled;
            });
        });
    };

    var deferredResolve = function (testName, value, test) {
        var done = jasmine.createSpy("done");

        it(testName + " (deferred resolve)", function () {
            var defer = subject.defer();
            test(defer.promise, done);
            defer.resolve(value);

            waitsFor(function () {
                return done.wasCalled;
            });
        });
    };

    helpers.testFulfilled = function (testName, value, test) {
        alreadyResolved(testName, value, test);
        deferredResolve(testName, value, test);
    };

    helpers.setSubject = function (theSubject) {
        subject = theSubject;
    };

    return helpers;
});
