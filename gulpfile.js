var gulp = require('gulp'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify');

gulp.task('default', function() {
	gulp.src(['index.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			optional: ["runtime"]
		}))
		.on("error", notify.onError('<%= error.message %>'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));

	gulp.src(['src/*.js'])
		.pipe(sourcemaps.init())
		.pipe(babel({
			optional: ["runtime"]
		}))
		.on("error", notify.onError('<%= error.message %>'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/src'));
});

gulp.task('watch', function() {
	gulp.watch(['index.js', 'src/*.js'], ['default']);
});
