<a href="http://promises-aplus.github.com/promises-spec">
    <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

Aye, promise!
-------------

ayepromise is a teeny-tiny promise library. It promises to pass the [Promises/A+](http://promises-aplus.github.io/promises-spec/) 1.1 Compliance Test Suite.

Why yet another promise library?
--------------------------------

ayepromise wants to be as small as possible, staying compatible to Q while fully implementing the spec. It's licenses under WTFPL and/or BSD.

ayepromise tries to be fully compatible with [kriskowal's Q](https://github.com/kriskowal/q) in such a way that you can always replace ```ayepromise``` with ```Q```. (There's a catch: ayepromise tries to strictly follow Promises/A+ 1.1 and will differ where Q does not.) It will not however try to implement anything close to the full feature set. Check ```test/CompatibilitySpecRunner.html``` to see ayepromise's test suite executed against Q.

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

Run the test suite
------------------

For the browser, first install dependencies via ```npm install``` and ```bower install``` and then ```open test/SpecRunner.html```.

For NodeJS install dependencies via ```npm install``` and run ```npm test```. This includes the [Promise/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).
