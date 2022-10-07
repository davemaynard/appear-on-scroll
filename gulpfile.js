const { src, dest, watch, series, parallel } = require(`gulp`);
const concat = require(`gulp-concat`);
const uglify = require(`gulp-uglify`);
const babel = require(`gulp-babel`);
const fs = require(`fs`);
const del = require(`del`);
const plumber = require(`gulp-plumber`);
const { options } = require(`./package.json`);

function cleanDist(callback) {
  del.sync(`${options.dist}`, { force: true });

  callback();
}

function moveJs() {
  const partials = fs.readFileSync(`${options.src}/js/scripts.js`, `utf-8`);
  arrPartials = partials.replace(/["']/g, ``).split(/\r?\n/);
  // remove empty lines
  for (let i = 0; i < arrPartials.length; i++) {
    const partialName = arrPartials[i];
    if (partialName === `` || partialName === undefined) {
      arrPartials.splice(i, 1);
      i--;
    } else {
      // prepend src to each path
      arrPartials[i] = `${options.src}/${partialName}`;
    }
  }

  return src(arrPartials)
    .pipe(
      plumber({
        errorHandler(error) {
          const err = `JavaScript error: ${error.message}`;
          /* eslint-disable-next-line */
          console.log(err);
        },
      }),
    )
    .pipe(
      babel({
        presets: [`@babel/env`],
      }),
    )
    .pipe(concat(`${options.js.filename}.js`))
    .pipe(uglify())
    .pipe(dest(`${options.dist}/`));
}

function watchFiles(callback) {
  watch([`${options.src}/js/**/*.js`], moveJs);

  callback();
}

exports.cleanDist = cleanDist;
exports.moveJs = moveJs;

exports.default = series(cleanDist, parallel(moveJs, watchFiles));

exports.release = series(cleanDist, moveJs);
