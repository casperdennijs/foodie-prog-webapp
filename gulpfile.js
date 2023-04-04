const gulp = require('gulp')
const concat = require('gulp-concat');
const minify = require('gulp-minify');

function defaultTask(cb) {
    return gulp.src([
        './source/js/*.js',
        './source/service-worker.js',
    ])
    .pipe(concat('index.js'))
    .pipe(minify())
    .pipe(gulp.dest('./public/js'))
}
  
exports.default = defaultTask