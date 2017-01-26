'use strict';

/*
dependencies:
npm i --save-dev gulp gulp-watch gulp-autoprefixer gulp-uglify gulp-sass gulp-sourcemaps gulp-rigger gulp-minify-css gulp-rename gulp-csscomb gulp-imagemin imagemin-pngquant browser-sync rimraf gulp-svgo gulp-typograf gulp-merge-media-queries
*/

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    csscomb = require('gulp-csscomb'),
    rename = require("gulp-rename"),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require('browser-sync'),
    svgo = require('gulp-svgo'),
    typograf = require('gulp-typograf'),
    rimraf = require('rimraf'),
    mmq = require('gulp-merge-media-queries'),
    reload = browserSync.reload;


var path = {
    src: {
        html: 'source/*.html',
        js: 'source/js/scripts.js',
        libs: 'source/js/vendor/**/*.*',
        style: 'source/sass/styles.scss',
        img: 'source/i/**/*.{jpg,png,svg}',
        svg: 'source/i/svg/*.svg',
        fonts: 'source/fonts/**/*.*'
    },
    watch: {
        html: 'source/**/*.html',
        js: 'source/js/**/*.*',
        libs: 'source/js/vendor/**/*.*',
        style: 'source/sass/**/*.scss',
        img: 'source/i/**/*.*',
        svg: 'source/i/svg/*.svg',
        fonts: 'source/fonts/**/*.*'
    },
    build: {
        html: 'assets/',
        js: 'assets/js/',
        libs: 'assets/js/vendor',
        css: 'assets/css/',
        img: 'assets/i/',
        svg: 'assets/i/svg',
        fonts: 'assets/fonts/'
    },
    clean: './assets/'
};


/* development settings */
var config = {
    server: {
        baseDir: './assets/'
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: 'dev'
};

gulp.task('server', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(typograf({lang: 'ru'}))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 7,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('svg:build', function () {
    gulp.src(path.src.svg)
        .pipe(svgo())
        .pipe(gulp.dest(path.build.svg))
        .pipe(reload({stream: true}));
});

gulp.task('libs:build', function() {
    return gulp.src(path.src.libs)
        .pipe(gulp.dest(path.build.libs))
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sass({
            includePaths: ['source/sass/'],
            errLogToConsole: true
        }))
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


/* production settings */
gulp.task('style:prod', function () {
    gulp.src(path.src.style)
        //.pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['source/sass/'],
            //outputStyle: 'compressed',
            //sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(mmq({
            log: true
        }))
        .pipe(cssmin())
        //.pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('js:prod', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        //.pipe(sourcemaps.init())
        .pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


/* builds */
gulp.task('build', [
    'html:build',
    'style:build',
    'style:prod',
    'js:build',
    'js:prod',
    'image:build',
    'svg:build',
    'libs:build',
    'fonts:build'
]);

gulp.task('build-prod', [
    'html:build',
    'style:build',
    'style:prod',
    'js:build',
    'js:prod',
    'image:build',
    'svg:build',
    'libs:build',
    'fonts:build'
]);

/* watchers */
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.libs], function(event, cb) {
        gulp.start('libs:build');
    });
});

/* run */
gulp.task('default', ['build', 'server', 'watch']); // gulp development build
gulp.task('prod', ['build-prod', 'server', 'watch']); //gulp production build