const gulp = require("gulp");
const { parallel, series } = require("gulp");

const uglify = require("gulp-uglify");
var sass = require('gulp-sass')(require('sass'));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */



// Scripts
function jsDev(cb) {
  gulp.src("src/js/*js")
    .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['@babel/preset-env']
      }))
      .pipe(concat("gyrotonic-trademark.js"))
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/js"));
  cb();
}
function js(cb) {
  gulp
    .src("src/js/*js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("gyrotonic-trademark.js"))
    .pipe(
      uglify({
        output: {
          comments: "some"
        }
      })
    )
    .pipe(gulp.dest("dist/js"));
  cb();
}

// Compile Sass
function css(cb) {
  gulp.src("src/sass/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer({
      browserlist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest("dist/css"))
    // Stream changes to all browsers
    .pipe(browserSync.stream());
  cb();
}


// Watch Files
function watch_files() {
  browserSync.init({
    server: {
      baseDir: "dist/"
    }
  });
  gulp.watch("src/sass/**/*.scss", css);
  gulp.watch("dist/*.html").on("change", browserSync.reload);
  gulp.watch("src/js/*.js", jsDev).on("change", browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(css, jsDev, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(css, js);
