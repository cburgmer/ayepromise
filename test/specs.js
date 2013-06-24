(function (definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition;
    } else {
        this.specs = definition;
    }
})(function (subject, libraryName) {
    var helpers = this.helpers || require('./helpers.js');
    helpers.setSubject(subject);

    describe(libraryName, function () {
        it("should indicate a pending promise", function () {
            var defer = subject.defer();

            expect(defer.promise.isPending()).toBe(true);
        });

        describe("resolve", function () {
            it("should indicate a resolved promise", function () {
                var defer = subject.defer();

                defer.resolve();

                expect(defer.promise.isPending()).toBe(false);
            });

            it("should return the result", function () {
                var defer = subject.defer();

                defer.resolve("21");

                expect(defer.promise.valueOf()).toEqual("21");
            });

            it("should return the promise itself as result if the promise hasn't been resolved yet", function () {
                var defer = subject.defer();

                expect(defer.promise.valueOf()).toBe(defer.promise);
            });

            it("should resolve 'null'", function () {
                var defer = subject.defer();

                defer.resolve(null);
            });
        });

        describe("on fulfill callback", function () {
            helpers.testFulfilled("should execute a given function when promised is resolved", null, function (promise, done) {
                promise.then(done);
            });

            it("should not execute a given function before resolved", function () {
                var defer = subject.defer(),
                    spy = jasmine.createSpy("call me");

                defer.promise.then(spy);

                expect(spy).not.toHaveBeenCalled();
            });

            helpers.testFulfilled("should pass the result to the callback", "the value", function (promise, done) {
                promise.then(function (value) {
                    expect(value).toBe("the value");
                    done();
                });
            });

            helpers.testFulfilled("should handle multiple callbacks", null, function (promise, done) {
                var spy = jasmine.createSpy("call me"),
                    yetAnotherSpy = jasmine.createSpy("call me too");

                promise.then(spy);
                promise.then(yetAnotherSpy);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                    expect(yetAnotherSpy).toHaveBeenCalled();

                    done();
                });
            });

            helpers.testFulfilled("should allow pipelining", null, function (promise, done) {
                var spy = jasmine.createSpy("call me"),
                    yetAnotherSpy = jasmine.createSpy("call me after the other spy finished"),
                    followingPromise;

                followingPromise = promise.then(spy);
                followingPromise.then(yetAnotherSpy);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                    expect(yetAnotherSpy).toHaveBeenCalled();
                });

                done();
            });

            helpers.testFulfilled("should pass the result of one call as argument to the following", null, function (promise, done) {
                promise
                    .then(function () {
                        return 42;
                    })
                    .then(function (value) {
                        expect(value).toBe(42);
                        done();
                    });
            });

            it("should only call the next link in the call chain when a returned promise has been resolved", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
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

            it("should pass the result from a promise on to the next function in a call chain", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                    yetAnotherSpy = jasmine.createSpy("call me after the other spy");

                defer.promise
                    .then(spy)
                    .then(yetAnotherSpy);

                defer.resolve();
                secondDefer.resolve("hey there");

                waitsFor(function () {
                    return yetAnotherSpy.wasCalled;
                });

                runs(function () {
                    expect(yetAnotherSpy).toHaveBeenCalledWith("hey there");
                });
            });

            it("should call the next link in the call chain with a returned, resolved promise", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                    yetAnotherSpy = jasmine.createSpy("call me after the other spy");

                defer.promise
                    .then(spy)
                    .then(yetAnotherSpy);

                secondDefer.resolve("99");
                defer.resolve();

                waitsFor(function () {
                    return yetAnotherSpy.wasCalled;
                });

                runs(function () {
                    expect(yetAnotherSpy).toHaveBeenCalledWith("99");
                });
            });

            it("should trigger only when the promised passed to resolve has been resolved", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me");

                spyOn(secondDefer.promise, 'then').andCallThrough();
                spyOn(secondDefer.promise, 'isPending').andCallThrough();
                spyOn(secondDefer.promise, 'valueOf').andCallThrough();

                defer.promise.then(spy);
                defer.resolve(secondDefer.promise);

                waits(10);

                runs(function () {
                    expect(spy).not.toHaveBeenCalled();

                    secondDefer.resolve("yay");
                });

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalledWith("yay");
                });
            });
       });

        describe("reject", function () {
            it("should resolve a promise on reject", function () {
                var defer = subject.defer();

                defer.reject();

                expect(defer.promise.isPending()).toBe(false);
            });

            it("should return the error", function () {
                var defer = subject.defer(),
                    error = new Error(21);

                defer.reject(error);

                expect(defer.promise.valueOf().exception).toBe(error);
            });
        });

        describe("on reject callback", function () {
            var error = new Error("didn't work out, sorry")
            helpers.testRejected("should execute a fail callback", null, function (promise, done) {
                promise.then(null, function () {
                    done();
                });
            });

            helpers.testRejected("should pass the error to the fail callback", error, function (promise, done) {
                promise.then(null, function (value) {
                    expect(value).toBe(error);
                    done();
                });
            });

            helpers.testFulfilled("should not trigger fail callback passed after promise has been fulfilled", null, function (promise, done) {
                var spy = jasmine.createSpy("don't call me");

                promise.then(function () {
                    expect(spy).not.toHaveBeenCalled();
                    done();
                }, spy);
            });

            helpers.testRejected("should not trigger fulfilled callback passed after promise has been rejected", null, function (promise, done) {
                var spy = jasmine.createSpy("don't call me");

                promise.then(spy, function () {
                    expect(spy).not.toHaveBeenCalled();
                    done();
                });
            });

            helpers.testRejected("should handle multiple fail callbacks", null, function (promise, done) {
                var spy = jasmine.createSpy("call me"),
                    yetAnotherSpy = jasmine.createSpy("call me too");

                promise.then(null, spy);
                promise.then(null, yetAnotherSpy);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                    expect(yetAnotherSpy).toHaveBeenCalled();
                    done();
                });
            });

            helpers.testRejected("should allow pipelining with a fail callback", null, function (promise, done) {
                var spy = jasmine.createSpy("call me"),
                    followingPromise;

                followingPromise = promise.then(null, spy);
                followingPromise.then(function () {
                    expect(spy).toHaveBeenCalled();
                    done();
                });
            });

            helpers.testFulfilled("should trigger a fail callback in a chain on a raised exception", null, function (promise, done) {
                var error = new Error("meh");

                promise
                    .then(function () {
                        throw error;
                    })
                    .then(null, function (value) {
                        expect(value).toBe(error);
                        done();
                    });
            });

            helpers.testFulfilled("should not trigger the call chain on a raised exception", null, function (promise, done) {
                var spy = jasmine.createSpy("call me").andThrow(new Error()),
                    anotherSpy = jasmine.createSpy("another spy");

                promise
                    .then(spy)
                    .then(anotherSpy);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(anotherSpy).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should trigger a fail callback in a chain on a failed promise", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    error = new Error("meh"),
                    spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                    failSpy = jasmine.createSpy("failed");

                defer.promise
                    .then(spy)
                    .then(null, failSpy);

                defer.resolve();
                secondDefer.reject(error);

                waitsFor(function () {
                    return failSpy.wasCalled;
                });

                runs(function () {
                    expect(failSpy).toHaveBeenCalledWith(error);
                });
            });

            it("should not trigger a then callback in a chain on a failed promise", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                    anotherSpy = jasmine.createSpy("another spy");

                defer.promise
                    .then(spy)
                    .then(anotherSpy)

                defer.resolve();
                secondDefer.reject(new Error());

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(anotherSpy).not.toHaveBeenCalled();
                });
            });

            it("should handle a 'catch-all' fail at the end of a call chain", function () {
                var defer = subject.defer(),
                    error = new Error("oopsie"),
                    errorSpy = jasmine.createSpy("error spy").andThrow(error),
                    anotherSpy = jasmine.createSpy("another spy"),
                    failSpy = jasmine.createSpy("fail spy");

                defer.promise
                    .then(errorSpy)
                    .then(anotherSpy)
                    .then(null, failSpy);

                defer.resolve();

                waitsFor(function () {
                    return failSpy.wasCalled;
                });

                runs(function () {
                    expect(failSpy).toHaveBeenCalledWith(error);
                });
            });

            it("should handle a call chain appended after a fail handler", function () {
                var defer = subject.defer(),
                    thenSpy = jasmine.createSpy("a spy"),
                    failSpy = jasmine.createSpy("fail spy");

                defer.promise
                    .then(null, failSpy)
                    .then(thenSpy);
                defer.resolve();

                waitsFor(function () {
                    return thenSpy.wasCalled;
                });

                runs(function () {
                    expect(thenSpy).toHaveBeenCalled();
                });
            });

            it("should trigger fail callback when the promised passed to resolve has been rejected", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    error = new Error("noes"),
                    spy = jasmine.createSpy("call me");

                defer.promise.then(null, spy);
                defer.resolve(secondDefer.promise);

                // Didn't know a better way to wait for Q triggering its internals
                waits(10);

                runs(function () {
                    expect(spy).not.toHaveBeenCalled();

                    secondDefer.reject(error);
                });

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });

            it("should reject immediately even when given a promise", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me");

                defer.promise.then(null, spy);
                defer.reject(secondDefer.promise);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalledWith(secondDefer.promise);
                });
            });
        });

        describe("fail shorthand", function () {
            it("should act as a shorthand to then", function () {
                var defer = subject.defer(),
                    error = new Error("fail"),
                    spy = jasmine.createSpy("call me");

                defer.promise.fail(spy);

                defer.reject(error);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });
        });
    });
});
