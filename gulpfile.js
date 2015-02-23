var gulp = require('gulp'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat');

gulp.task('default', function () {
	gulp.src(['index.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			optional: ["runtime"]
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));

	gulp.src(['src/*.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			optional: ["runtime"]
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/src'));
});