var gulp = require("gulp"),
    watch = require("gulp-watch"),
    prefixer = require("gulp-autoprefixer"),
    uglify = require("gulp-uglify"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    rigger = require("gulp-rigger"),
    cssmin = require("gulp-minify-css"),
    imagemin = require("gulp-imagemin"),
    pngquant = require("imagemin-pngquant"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
  build: { //Указание, куда складывать готовые файлы сборки
    html: "build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/"
  },
  src: { //Пути, откуда брать исходники
    html: "src/*.html",
    js: "src/js/main.js",
    style: "src/style/main.scss",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  watch: {  //Указание, за изменением каких файлов наблюдать
    html: "src/**/*.html",
    js: "src/js/**/*js",
    style: "src/style/**/*.scss",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  clean: "./build"
};

var config = {  //Переменная с настройками dev сервера
  server: {
    baseDir: "./build"
  },
  tunnel: true,
  host: "localhost",
  port: 9000,
  logPrefix: "SempreMai"
};

gulp.task("html-build", function () { //Таск для сборки html
  gulp.src(path.src.html) //Выбираем файлы источника из js object
    .pipe(rigger()) //Прогоняем через rigger
    .pipe(gulp.dest(path.build.html)) //Выплевываем в папку build
    .pipe(reload({stream: true})); //Перезагружаем сервер для обновлений
});

gulp.task("js-build", function () {
  gulp.src(path.src.js) //Находим main.js
    .pipe(rigger()) // Прогоняем через rigger
    .pipe(sourcemaps.init()) // Инициализируем sourcemaps
    .pipe(uglify()) //Сжимаем js
    .pipe(sourcemaps.write()) //Прописываем карты
    .pipe(gulp.dest(path.build.js)) //Выплёвываем готовый файл в build
    .pipe(reload({stream: true})); //Перезагружаем сервер
});

gulp.task("style-build", function () {
  gulp.src(path.src.style) // Выбираем main.scss
    .pipe(sourcemaps.init())  //Инициализируем карты
    .pipe(sass()) //Компилируем
    .pipe(prefixer()) //Добавляем вендорные префиксеры
    .pipe(cssmin()) //Сжимаем
    .pipe(sourcemaps.write()) //Прописываем карты
    .pipe(gulp.dest(path.build.css)) //Кладем в build
    .pipe(reload({stream: true}));
});

gulp.task("image-build", function () {
  gulp.src(path.src.img) //Выбираем картинки
    .pipe(imagemin({ //Сжимаем их
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img)) // Кладем в build
    .pipe(reload({stream: true}));
});

gulp.task("fonts-build", function () { //Шрифты просто копируем в build
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task("build", [ //Собираем в этом таске всё,
  "html-build",
  "js-build",
  "style-build",
  "image-build",
  "fonts-build"
]);

gulp.task("watch", function () { //Файлы, за изменением которых следим
  watch([path.watch.html], function(event, cb) {
    gulp.start("html-build");
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start("style-build");
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start("js-build");
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start("image-build");
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start("fonts-build");
  });
});

gulp.task("webserver", function () { //Запуск сервера
  browserSync(config);
});

gulp.task("clean", function (cb) { //Полностью удаляет build
  rimraf(path.clean, cb);
});

gulp.task("default", ["build", "webserver", "watch"]); //Запускает всю ситему
