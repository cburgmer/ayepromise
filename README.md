[![Build Status](https://secure.travis-ci.org/cburgmer/ayepromise.png?branch=master)](http://travis-ci.org/cburgmer/ayepromise)
Aye, promise!
-------------

ayepromise is a teeny-tiny promise library. It promises to pass the [Promises/A+](http://promises-aplus.github.io/promises-spec/) Compliance Test Suite right now (and not just eventually in the future).

Aye tries to be fully compatible with [kriskowal's Q](https://github.com/kriskowal/q) in such a way that you can always replace ```aye``` with ```Q```. It will however not try to implement anything close to the full feature set. Check ```test/CompatibilitySpecRunner.html``` to see Aye's test suite executed against Q.

[![Promises/A+ 1.0 compliant](http://promisesaplus.com/assets/logo-small.png)](http://promisesaplus.com/)

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

* Browser:

    First install dependencies via ```npm install``` and ```bower install```. Point your browser to ```test/SpecRunner.html``` and ```test/CompatibilitySpecRunner.html```.

* Node:

    Install dependencies via ```npm install``` and run ```npm test```.

* Promise/A+ Compliance Test Suite:

        $ PATH=./node_modules/.bin/:$PATH promises-aplus-tests test/complianceTestSuiteAdapter.js
