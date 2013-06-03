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
    });
});
