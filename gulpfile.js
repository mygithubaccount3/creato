var gulp      = require('gulp'),
    sass      = require('gulp-sass'),
    autoprefixer = require('autoprefixer'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    browserS  = require('browser-sync'),
    concat    = require('gulp-concat'),
    uglify    = require('gulp-uglify'),
    cleanCSS  = require('gulp-clean-css'),
    del       = require('del');
    pngquant = require('imagemin-pngquant');

gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');

    return gulp.src('dist/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({browsers: ['last 3 versions']}) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
    return gulp.src('app/css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserS.reload({stream: true}))
});

gulp.task('minify-css', function () {
    return gulp.src('dist/**/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename('css/general.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('sass-auto', gulp.series('sass','autoprefixer', 'minify-css'));

gulp.task('scripts', function () {
    return gulp.src('app/jslibs/jquery-3.2.1.js')
        .pipe(concat('app/js/libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

gulp.task('clean', function () {
    return del.sync('dist')
});

gulp.task('browserS', function () {
    browserS({
        server: {
            baseDir: 'dist'
        },
        notify: false
    })
});

gulp.task('watch', function() {
    gulp.watch('app/css/*.scss', gulp.series('sass-auto'));
    gulp.watch("app/*.html", gulp.series('buildDist')).on('change', browserS.reload);
    gulp.watch('app/js/*.js', gulp.series('buildDist')).on('change', browserS.reload);
});

gulp.task('buildDist', function () {
    var buildImg = gulp.src('app/images/*')
        .pipe(imagemin([pngquant({progressive: true}), imagemin.jpegtran({progressive: true})], {verbose: true}))
        .pipe(gulp.dest('dist/images'));

    var buildJs = gulp.src([
        'app/js/libs.min.js',
        'app/js/index.js'
    ])
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('clean','sass-auto', 'buildDist'));
gulp.task('default', gulp.parallel('build','browserS','watch'));
