describe(libraryName, function () {
    describe("defer", function () {
        it("should indicate a pending promise", function () {
            var defer = aye.defer();

            expect(defer.promise.isPending()).toBe(true);
        });

        it("should indicate a resolved promise", function () {
            var defer = aye.defer();

            defer.resolve();

            expect(defer.promise.isPending()).toBe(false);
        });

        it("should return the result", function () {
            var defer = aye.defer();

            defer.resolve("21");

            expect(defer.promise.valueOf()).toEqual("21");
        });

        it("should return the promise itself as result if the promise hasn't been resolved yet", function () {
            var defer = aye.defer();

            expect(defer.promise.valueOf()).toBe(defer.promise);
        });

        it("should execute a given function once resolved", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.promise.then(spy);

            expect(spy).not.toHaveBeenCalled();

            defer.resolve();

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalled();
            });
        });

        it("should pass the result to the callback", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.promise.then(spy);

            defer.resolve("half the truth");

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalledWith("half the truth");
            });
        });

        it("should trigger the callback even when passed after the promise has been resolved", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.resolve();
            defer.promise.then(spy);

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalled();
            });
        });

        it("should handle multiple callbacks", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me"),
                yetAnotherSpy = jasmine.createSpy("call me too");

            defer.promise.then(spy);
            defer.promise.then(yetAnotherSpy);

            defer.resolve();

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalled();
                expect(yetAnotherSpy).toHaveBeenCalled();
            });
        });

        it("should allow pipelining", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me"),
                yetAnotherSpy = jasmine.createSpy("call me after the other spy finished"),
                followingPromise;

            followingPromise = defer.promise.then(spy);
            followingPromise.then(yetAnotherSpy);

            defer.resolve();

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalled();
                expect(yetAnotherSpy).toHaveBeenCalled();
            });
        });

        it("should pass the result of one call as argument to the following", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me").andReturn(42),
                yetAnotherSpy = jasmine.createSpy("call me after the other spy finished");

            defer.promise
                .then(spy)
                .then(yetAnotherSpy);

            defer.resolve();

            waitsFor(function () {
                return yetAnotherSpy.wasCalled;
            });

            runs(function () {
                expect(yetAnotherSpy).toHaveBeenCalledWith(42);
            });
        });

        it("should pass the result of one call as argument to the following, also for an already resolved promise", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me").andReturn(42),
                yetAnotherSpy = jasmine.createSpy("call me after the other spy finished");

            defer.resolve();

            defer.promise
                .then(spy)
                .then(yetAnotherSpy);

            waitsFor(function () {
                return yetAnotherSpy.wasCalled;
            });

            runs(function () {
                expect(yetAnotherSpy).toHaveBeenCalledWith(42);
            });
        });

        it("should only call the next link in the call chain when a returned promise has been resolved", function () {
            var defer = aye.defer(),
                secondDefer = aye.defer(),
                spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                yetAnotherSpy = jasmine.createSpy("call me after the other spy");

            defer.promise
                .then(spy)
                .then(yetAnotherSpy);

            defer.resolve();

            waitsFor(function () {
                return spy.wasCalled;
            });

            runs(function () {
                expect(spy).toHaveBeenCalled();
                expect(yetAnotherSpy).not.toHaveBeenCalled();
            });

            runs(function () {
                secondDefer.resolve();
            });

            waitsFor(function () {
                return yetAnotherSpy.wasCalled;
            });

            runs(function () {
                expect(yetAnotherSpy).toHaveBeenCalled();
            });
        });
    });
});
