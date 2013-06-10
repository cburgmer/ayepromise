Aye, promise!
-------------

Aye is a teeny-tiny promise library. It will never promise to eventually implement [Promises/A+](http://promises-aplus.github.io/promises-spec/) in the future.

Aye tries to be fully compatible with [kriskowal's Q](https://github.com/kriskowal/q) in such a way that you can always replace ```aye``` with ```Q```. It will however not try to implement anything close to the full feature set. Check ```test/CompatibilitySpecRunner.html``` to see Aye's test suite executed against Q.

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

Install
-------

    $ bower install aye

Run the test suite
------------------

First install dependencies via ```bower install```. Point your browser to ```test/SpecRunner.html``` and ```test/CompatibilitySpecRunner.html```.
