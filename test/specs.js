(function (definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition;
    } else {
        this.specs = definition;
    }
})(function (subject, libraryName) {
    var helpers = this.helpers || require('./helpers.js');

    describe(libraryName, function () {

        beforeEach(function () {
            helpers.setSubject(subject);
        });

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

            it("should not fulfill an already fulfilled promise", function () {
                var defer = subject.defer(),
                    onFulfillCallback = jasmine.createSpy('onFulfill'),
                    done = false;
                defer.promise.then(onFulfillCallback);
                defer.resolve(null);

                setTimeout(function() {
                    onFulfillCallback.reset();
                    defer.resolve(42);

                    setTimeout(function() {
                        expect(onFulfillCallback).not.toHaveBeenCalled();
                        done = true;
                    }, 10);
                }, 10);

                waitsFor(function () {
                    return done;
                });
            });

            it("should not fulfill a rejected promise", function () {
                var defer = subject.defer(),
                    onFulfillCallback = jasmine.createSpy('onFulfill'),
                    done = false;
                defer.promise.then(onFulfillCallback);
                defer.reject(new Error('just because'));

                setTimeout(function() {
                    defer.resolve(42);

                    setTimeout(function() {
                        expect(onFulfillCallback).not.toHaveBeenCalled();
                        done = true;
                    }, 10);
                }, 10);

                waitsFor(function () {
                    return done;
                });
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
                    return yetAnotherSpy.wasCalled;
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

            helpers.testFulfilled("should pass the result from a promise on to the next function in a call chain", null, function (promise, done) {
                var defer = subject.defer();

                promise
                    .then(function () {
                        return defer.promise;
                    })
                    .then(function (value) {
                        expect(value).toBe("hey there");
                        done();
                    });

                defer.resolve("hey there");
            });

            helpers.testFulfilled("should call the next link in the call chain with the resolved value", null, function (promise, done) {
                var defer = subject.defer();

                promise
                    .then(function () {
                        return defer.promise;
                    })
                    .then(function (value) {
                        expect(value).toBe("99");
                        done();
                    });

                defer.resolve("99");
            });

            it("should trigger only when the promised passed to resolve has been resolved", function () {
                var defer = subject.defer(),
                    secondDefer = subject.defer(),
                    spy = jasmine.createSpy("call me");

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

            helpers.testFulfilled("should allow non-functions (an integer) in fulfill handler", "hey there", function (promise, done) {
                var nonFunction = 42;

                promise
                    .then(nonFunction)
                    .then(function (value) {
                        expect(value).toBe("hey there");
                        done();
                    });
            });

            helpers.testFulfilled("should allow non-functions (undefined) in fulfill handler", "hey there", function (promise, done) {
                var nonFunction;

                promise
                    .then(nonFunction)
                    .then(function (value) {
                        expect(value).toBe("hey there");
                        done();
                    });
            });

            helpers.testFulfilled("should accept a pseudo promise", null, function (promise, done) {
                promise
                    .then(function () {
                        return {
                            then: function (f) {
                                f(42);
                            }
                        };
                    })
                    .then(function (value) {
                        expect(value).toBe(42);
                        done();
                    });
            });

            helpers.testFulfilled("should return before calling handler", null, function (promise, done) {
                var isDone = false;
                promise
                    .then(function () {
                        expect(isDone).toBeTruthy();
                        done();
                    });
                isDone = true;
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

            it("should not reject a fulfilled promise", function () {
                var defer = subject.defer(),
                    onRejectCallback = jasmine.createSpy('onReject'),
                    done = false;
                defer.promise.then(null, onRejectCallback);
                defer.resolve(null);

                setTimeout(function() {
                    defer.reject(new Error('because'));

                    setTimeout(function() {
                        expect(onRejectCallback).not.toHaveBeenCalled();
                        done = true;
                    }, 10);
                }, 10);

                waitsFor(function () {
                    return done;
                });
            });

            it("should not reject a rejected promise", function () {
                var defer = subject.defer(),
                    onRejectCallback = jasmine.createSpy('onReject'),
                    done = false;
                defer.promise.then(null, onRejectCallback);
                defer.reject(new Error('original reason'));

                setTimeout(function() {
                    onRejectCallback.reset();
                    defer.reject(new Error('because'));

                    setTimeout(function() {
                        expect(onRejectCallback).not.toHaveBeenCalled();
                        done = true;
                    }, 10);
                }, 10);

                waitsFor(function () {
                    return done;
                });
            });
        });

        describe("on reject callback", function () {
            var error = new Error("didn't work out, sorry");
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

            helpers.testFulfilled("should trigger a fail callback in a chain on a failed promise", null, function (promise, done) {
                var defer = subject.defer(),
                    error = new Error("meh");

                promise
                    .then(function () {
                        return defer.promise;
                    })
                    .then(null, function (value) {
                        expect(value).toBe(error);
                        done();
                    });

                defer.reject(error);
            });

            helpers.testFulfilled("should not trigger a then callback in a chain on a failed promise", null, function (promise, done) {
                var defer = subject.defer(),
                    anotherSpy = jasmine.createSpy("another spy");

                promise
                    .then(function () {
                        return defer.promise;
                    })
                    .then(anotherSpy, function () {
                        expect(anotherSpy).not.toHaveBeenCalled();
                        done();
                    });

                defer.reject(new Error());
            });

            helpers.testFulfilled("should handle a 'catch-all' fail at the end of a call chain", null, function (promise, done) {
                var error = new Error("oopsie");

                promise
                    .then(function () {
                        throw error;
                    })
                    .then(function () {})
                    .then(null, function (value) {
                        expect(value).toBe(error);
                        done();
                    });
            });

            helpers.testFulfilled("should handle a call chain appended after a fail handler", null, function (promise, done) {
                promise
                    .then(null, function () {})
                    .then(function () {
                        done();
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

            helpers.testRejected("should allow non-functions (an integer) in reject handler", error, function (promise, done) {
                var nonFunction = 42;

                promise
                    .then(null, nonFunction)
                    .then(null, function (value) {
                        expect(value).toBe(error);
                        done();
                    });
            });

            helpers.testRejected("should allow non-functions (undefined) in reject handler", error, function (promise, done) {
                var nonFunction;

                promise
                    .then(null, nonFunction)
                    .then(null, function (value) {
                        expect(value).toBe(error);
                        done();
                    });
            });

            helpers.testRejected("should return before calling handler", error, function (promise, done) {
                var isDone = false;
                promise
                    .then(null, function () {
                        expect(isDone).toBeTruthy();
                        done();
                    });
                isDone = true;
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
