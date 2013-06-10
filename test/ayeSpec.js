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

        it("should pass the result from a promise on to the next function in a call chain", function () {
            var defer = aye.defer(),
                secondDefer = aye.defer(),
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
            var defer = aye.defer(),
                secondDefer = aye.defer(),
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
            var defer = aye.defer(),
                secondDefer = aye.defer(),
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

        it("should trigger fail callback when the promised passed to resolve has been rejected", function () {
            var defer = aye.defer(),
                secondDefer = aye.defer(),
                error = new Error("noes"),
                spy = jasmine.createSpy("call me");

            spyOn(secondDefer.promise, 'then').andCallThrough();
            spyOn(secondDefer.promise, 'isPending').andCallThrough();
            spyOn(secondDefer.promise, 'valueOf').andCallThrough();

            defer.promise.fail(spy);
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

        describe("error handling", function () {
            it("should resolve a promise on reject", function () {
                var defer = aye.defer();

                defer.reject();

                expect(defer.promise.isPending()).toBe(false);
            });

            it("should return the error", function () {
                var defer = aye.defer(),
                    error = new Error(21);

                defer.reject(error);

                expect(defer.promise.valueOf().exception).toBe(error);
            });

            it("should execute a fail callback", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("fail callback");

                defer.promise.fail(spy);

                defer.reject();

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                });
            });

            it("should pass the error to the fail callback", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("call me"),
                    error = new Error("didn't work out, sorry");

                defer.promise.fail(spy);

                defer.reject(error);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });

            it("should trigger the fail callback even when passed after the promise has been resolved", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("call me");

                defer.reject();
                defer.promise.fail(spy);

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                });
            });

            it("should not trigger fail callback passed after promise has been fulfilled", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("don't call me"),
                    successSpy = jasmine.createSpy("call me");

                defer.resolve();
                defer.promise.then(successSpy)
                defer.promise.fail(spy);

                waitsFor(function () {
                    return successSpy.wasCalled;
                });

                runs(function () {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            it("should not trigger then callback passed after promise has been rejected", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("don't call me"),
                    failSpy = jasmine.createSpy("call me");

                defer.reject();
                defer.promise.then(spy)
                defer.promise.fail(failSpy);

                waitsFor(function () {
                    return failSpy.wasCalled;
                });

                runs(function () {
                    expect(spy).not.toHaveBeenCalled();
                });
            });

            it("should handle multiple fail callbacks", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("call me"),
                    yetAnotherSpy = jasmine.createSpy("call me too");

                defer.promise.fail(spy);
                defer.promise.fail(yetAnotherSpy);

                defer.reject();

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                    expect(yetAnotherSpy).toHaveBeenCalled();
                });
            });

            it("should allow pipelining with a fail callback", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("call me"),
                    yetAnotherSpy = jasmine.createSpy("call me after the other spy finished"),
                    followingPromise;

                followingPromise = defer.promise.fail(spy);
                followingPromise.then(yetAnotherSpy);

                defer.reject();

                waitsFor(function () {
                    return yetAnotherSpy.wasCalled;
                });

                runs(function () {
                    expect(spy).toHaveBeenCalled();
                    expect(yetAnotherSpy).toHaveBeenCalled();
                });
            });

            it("should trigger a fail callback in a chain on a raised exception", function () {
                var defer = aye.defer(),
                    error = new Error("meh")
                    spy = jasmine.createSpy("call me").andThrow(error),
                    failSpy = jasmine.createSpy("failed");

                defer.promise
                    .then(spy)
                    .fail(failSpy);

                defer.resolve();

                waitsFor(function () {
                    return failSpy.wasCalled;
                });

                runs(function () {
                    expect(failSpy).toHaveBeenCalledWith(error);
                });
            });

            it("should not trigger the call chain on a raised exception", function () {
                var defer = aye.defer(),
                    spy = jasmine.createSpy("call me").andThrow(new Error()),
                    anotherSpy = jasmine.createSpy("another spy");

                defer.promise
                    .then(spy)
                    .then(anotherSpy);

                defer.resolve();

                waitsFor(function () {
                    return spy.wasCalled;
                });

                runs(function () {
                    expect(anotherSpy).not.toHaveBeenCalled();
                });
            });

            it("should trigger a fail callback in a chain on a failed promise", function () {
                var defer = aye.defer(),
                    secondDefer = aye.defer(),
                    error = new Error("meh"),
                    spy = jasmine.createSpy("call me").andReturn(secondDefer.promise),
                    failSpy = jasmine.createSpy("failed");

                defer.promise
                    .then(spy)
                    .fail(failSpy);

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
                var defer = aye.defer(),
                    secondDefer = aye.defer(),
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
                var defer = aye.defer(),
                    error = new Error("oopsie"),
                    errorSpy = jasmine.createSpy("error spy").andThrow(error),
                    anotherSpy = jasmine.createSpy("another spy"),
                    failSpy = jasmine.createSpy("fail spy");

                defer.promise
                    .then(errorSpy)
                    .then(anotherSpy)
                    .fail(failSpy);

                defer.resolve();

                waitsFor(function () {
                    return failSpy.wasCalled;
                });

                runs(function () {
                    expect(failSpy).toHaveBeenCalledWith(error);
                });
            });

            it("should handle a call chain appended after a fail handler", function () {
                var defer = aye.defer(),
                    thenSpy = jasmine.createSpy("a spy"),
                    failSpy = jasmine.createSpy("fail spy");

                defer.promise
                    .fail(failSpy)
                    .then(thenSpy);
                defer.resolve();

                waitsFor(function () {
                    return thenSpy.wasCalled;
                });

                runs(function () {
                    expect(thenSpy).toHaveBeenCalled();
                });
            });
        });
    });
});
