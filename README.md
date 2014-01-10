<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

Aye, promise!
-------------

ayepromise is a teeny-tiny promise library. It used to promise to pass the [Promises/A+](http://promises-aplus.github.io/promises-spec/) Compliance Test Suite 1.0, but with new changes to the spec, this might only become true for 1.1 eventually in the future.

Aye tries to be fully compatible with [kriskowal's Q](https://github.com/kriskowal/q) in such a way that you can always replace ```aye``` with ```Q```. It will not however try to implement anything close to the full feature set. Check ```test/CompatibilitySpecRunner.html``` to see ayepromise's test suite executed against Q.

[![Build Status](https://secure.travis-ci.org/cburgmer/ayepromise.png?branch=master)](http://travis-ci.org/cburgmer/ayepromise)

Why?
----

Allow an asyncronous function to return a promise

    aPromiseReturningFunction()
        .then(someOtherAsyncStuff)
        .then(somethingOnTopOfAllThat)
        .then(function (result) {

        })
        .fail(function (error) {

        });

omitting the "pyramid of doom".

Make an existing "old-school" function promise aware:

    var myPromisingXhr = function (url) {
        var defer = aye.defer();
        ...
        xhr.onload = function (content) {
            defer.resolve(content);
        };
        xhr.onerror = function (e) {
            defer.reject(e);
        };
        xhr.send();
        return defer.promise;
    };

Build minified source and run the test suite
--------------------------------------------

For NodeJS install ```gulp``` and dependencies via ```npm install```. Then run ```gulp```. This includes the [Promise/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

For the test suite in the browser, first install dependencies via ```npm install``` and ```bower install``` and then ```open test/SpecRunner.html```.

