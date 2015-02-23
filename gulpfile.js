var gulp = require('gulp'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat');

gulp.task('default', function () {
	return gulp.src(['index.js', 'src/**/*.js'])
			.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(concat('purereflux.js'))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('dist'));
});