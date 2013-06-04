describe("aye", function () {
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

        it("should throw an error if the promise hasn't been resolved yet", function () {
            var defer = aye.defer();

            expect(function () { defer.promise.valueOf() }).toThrow(new Error("Promise hasn't been resolved yet"));
        });

        it("should execute a given function once resolved", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.promise.then(spy);

            expect(spy).not.toHaveBeenCalled();

            defer.resolve();

            expect(spy).toHaveBeenCalled();
        });

        it("should pass the result to the callback", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.promise.then(spy);

            defer.resolve("half the truth");

            expect(spy).toHaveBeenCalledWith("half the truth");
        });

        it("should trigger the callback even when passed after the promise has been resolved", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me");

            defer.resolve();
            defer.promise.then(spy);

            expect(spy).toHaveBeenCalled();
        });

        it("should handle multiple callbacks", function () {
            var defer = aye.defer(),
                spy = jasmine.createSpy("call me"),
                yetAnotherSpy = jasmine.createSpy("call me too");

            defer.promise.then(spy);
            defer.promise.then(yetAnotherSpy);

            defer.resolve();

            expect(spy).toHaveBeenCalled();
            expect(yetAnotherSpy).toHaveBeenCalled();
        });
    });
});
