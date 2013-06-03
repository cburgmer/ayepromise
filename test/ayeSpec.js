describe("aye", function () {
    describe("defer", function () {
        it("should indicate a pending promise", function () {
            var defer = aye.defer();

            expect(defer.promise.isPending()).toBe(true);
        });

        it("should indicate a promise resolved promise", function () {
            var defer = aye.defer();

            defer.resolve();

            expect(defer.promise.isPending()).toBe(false);
        });
    });
});
