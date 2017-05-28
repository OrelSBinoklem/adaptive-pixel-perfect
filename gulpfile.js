// JavaScript Document

'use strict';

var gulp = require('gulp'),
    //watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    //rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    //cleanCSS = require('gulp-clean-css'),
    //rimraf = require('rimraf'),
    //concat = require('gulp-concat'),
    //concatCss = require('gulp-concat-css'),
    through2 = require('through2').obj,
    changed = require('gulp-changed'),
	mkdirp = require('mkdirp'),
    plumber = require('gulp-plumber');

gulp.task('style', function () {
    gulp.src("src/public/**/*.sass")
        .pipe(through2(function(file, enc, callback){
            //console.log("--"+file.path);
            callback(null, file);
        }))
        .pipe(plumber())
        .pipe(changed("public", {extension: '.css'}))
        .pipe(through2(function(file, enc, callback){
            //console.log("++"+file.path);
            callback(null, file);
        }))
        .pipe(sourcemaps.init())
        .pipe(sass()) //Скомпилируем
        //.pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write("."))
        /*.pipe(through2(function(file, enc, callback){//Добавим к пути мап файлов ?a-pp=1
            if(!/.map/.test(file.extname)) {
                file.contents = new Buffer(file.contents.toString().replace(/(\.css\.map)([\S\s]{1,3}$)/gim, "$1?a-pp=1$2"));
                callback(null, file);
            }
        }))*/
        .pipe(gulp.dest("public"));
});

gulp.task('css', function () {
    gulp.src("src/public/**/*.css")
        .pipe(changed("public"))
        .pipe(cssmin()) //Сожмем
        .pipe(gulp.dest("public"));
});

gulp.task('js', function () {
    gulp.src([
            "src/public/**/*.js",
            "!src/public/js/require/require.js",
            "!src/public/js/main.js",
            "!src/public/js/ace/**/*.*",
            "!src/public/js/acedemo/**/*.*"
    ])
        .pipe(plumber())
        .pipe(changed("public"))
        .pipe(sourcemaps.init())
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write('.'))
        /*.pipe(through2(function(file, enc, callback){//Добавим к пути мап файлов ?a-pp=1
            if(!/.map/.test(file.extname)) {
                file.contents = new Buffer(file.contents.toString().replace(/(\.js\.map)([\S\s]{1,3}$)/gim, "$1?a-pp=1$2"));
                callback(null, file);
            }
        }))*/
        .pipe(gulp.dest("public"));
});

gulp.task('js_uncompress', function () {
    gulp.src([
        "src/public/js/require/require.js",
        "src/public/js/main.js",
        "src/public/js/ace/**/*.*",
        "src/public/js/acedemo/**/*.*"
    ],
        {base: "src/public"})
        .pipe(plumber())
        //.pipe(changed("public"))
        .pipe(gulp.dest("public"));
});

//content
gulp.task('content', function () {
    gulp.src("src/public/**/*.{jpg,png,gif,svg,otf,eot,svg,ttf,woff,woff2,json}")
        .pipe(changed("public"))
        .pipe(gulp.dest("public"));
});

gulp.task('index.html', function () {
    gulp.src("src/public/index.html")
        .pipe(changed("public"))
        .pipe(gulp.dest("public"));
});

mkdirp('public/design-thumbnails', function (err) {
    if (err) console.error(err);
});

/*gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});*/

gulp.task('build', [
    'index.html',
    'style',
    'css',
    "js",
    "js_uncompress",
    'content'
]);

gulp.task('default', ['build']);

gulp.watch("src/public/index.html", ['index.html']);
gulp.watch("src/public/**/*.sass", ['style']);
gulp.watch("src/public/**/*.css", ['css']);
gulp.watch("src/public/**/*.js", ['js', 'js_uncompress']);
gulp.watch("src/public/**/*.{jpg,png,gif,svg,otf,eot,svg,ttf,woff,woff2,json}", ['content']);