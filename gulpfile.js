var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jasmine = require('gulp-jasmine'),
    uglify = require('gulp-uglify'),
    promisesAplusTests = require('promises-aplus-tests'),
    adapter = require('./test/complianceTestSuiteAdapter');

// set dependency to work around concurrent runs messing up and failing both test suites
gulp.task('promisesAplusTests', ['ourTests'], function(cb) {
    promisesAplusTests(adapter, cb);
});

gulp.task('ourTests', function(cb) {
    gulp.src(['*.js', 'test/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    gulp.src(['test/ayeSpec.js', 'test/qIntegrationSpec.js'])
        .pipe(jasmine())
        // work around https://github.com/sindresorhus/gulp-jasmine/issues/3
        .pipe({
            on: function () {},
            emit: function () {},
            removeListener: function () {},
            end: cb
        });
});

gulp.task('test', function(cb) {
    gulp.run('ourTests', 'promisesAplusTests', cb);
});

gulp.task('min', ['test'], function() {
    gulp.src('ayepromise.js')
      .pipe(uglify())
      .pipe(gulp.dest('build/'));
});

gulp.task('watch', function (cb) {
    gulp.watch(['*.js', 'test/*.js'], function() {
        gulp.run('test', cb);
    });
});

gulp.task('default', function(cb) {
    gulp.run('min', cb);
});
