
const esbuild = require('esbuild')
const stylus = require('stylus')
const fs = require('fs')
const { copy } = require('fs-extra')

const startTime = Date.now()

const paths = {
  js: { entry: ['./src/index.js'], out: './public/index.js' },
  css: { entry: './src/index.styl', out: './public/styles.css' },
  html: { entry: './src/index.html', out: './public/index.html' },
  static: { entry: './src/assets/', out: './public/assets/' }
}

function buildJS () {
  const startTime = Date.now()
  return esbuild.build({
    entryPoints: paths.js.entry,
    outfile: paths.js.out,
    bundle: true,
    minify: !(process.env.NODE_ENV === 'development'),
    sourcemap: process.env.NODE_ENV === 'development'
  }).catch(err => {
    console.error('JS build error:', err)
  }).then(data => {
    if (process.env.NODE_ENV !== 'development') console.info('JS succefull builded in ', Date.now() - startTime, 'ms')
    if (data.warnings && data.warnings.length) {
      console.warn(data.warnings)
    }
    return data
  })
}

function buildCSS () {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    stylus(fs.readFileSync(paths.css.entry, 'utf8'))
      .render((err, css) => {
        if (err) {
          console.error('CSS build error:', err)
          reject(err)
        }
        if (process.env.NODE_ENV !== 'development') console.info('CSS succefull builded in ', Date.now() - startTime, 'ms')
        fs.writeFileSync(paths.css.out, css)
        resolve(css)
      })
  })
}

function copyStatic () {
  return copy(paths.static.entry, paths.static.out).catch(err=>{})
}

function copyHtml () {
  return fs.promises.copyFile(paths.html.entry, paths.html.out)
}

if (process.env.NODE_ENV !== 'development') {
  (async () => {
    await Promise.all([buildJS(), buildCSS(), copyHtml(), copyStatic()])
    console.info('Build complete in ', Date.now() - startTime, 'ms')
  })()
}

module.exports = { buildJS, buildCSS, copyHtml, copyStatic }
