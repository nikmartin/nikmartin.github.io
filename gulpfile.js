var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = [
  '/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + new Date().getFullYear(),
  ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> \n',
  ' */\n',
  '\n',
].join('');

// Compile SCSS
gulp.task('css:compile', () => {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(
      sass
        .sync({
          outputStyle: 'expanded',
        })
        .on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      header(banner, {
        pkg: pkg,
      })
    )
    .pipe(gulp.dest('./css'));
});

// Minify CSS
gulp.task('css:minify', gulp.series('css:compile', () => {
  return gulp
    .src(['./css/*.css', '!./css/*.min.css'])
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
}));

// CSS
gulp.task('css', gulp.series('css:compile', 'css:minify'));

// Minify JavaScript
gulp.task('js:minify', function () {
  return gulp
    .src(['./js/*.js', '!./js/*.min.js'])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(
      header(banner, {
        pkg: pkg,
      })
    )
    .pipe(gulp.dest('./js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', gulp.series('js:minify'));

// Default task
gulp.task('default', gulp.series('css', 'js'));

// Configure the browserSync task
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
});

// Dev task
gulp.task('dev', gulp.series('css', 'js', 'browserSync', function () {
  gulp.watch('./scss/**/*.scss', {usePolling:true}, ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
  gulp.watch('./css/*.css', browserSync.reload);
}));
