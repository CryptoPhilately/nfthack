
const esbuild = require('esbuild')
const stylus = require('stylus')
const fs = require('fs')

const paths = {
  js: { entry: ['./src/index.js'], out: './dist/index.js' },
  css: { entry: './src/index.styl', out: './dist/styles.css' },
  html: { entry: './src/index.html', out: './dist/index.html' }
}

function buildJS () {
  return esbuild.build({
    entryPoints: paths.js.entry,
    outfile: paths.js.out,
    bundle: true
  }).catch(err => {
    console.error('JS build error:', err)
  }).then(data => {
    if (data.warnings && data.warnings.length) {
      console.warn(data.warnings)
    }
    return data
  })
}

function buildCSS () {
  return new Promise((resolve, reject) => {
    stylus(fs.readFileSync(paths.css.entry, 'utf8'))
      .render((err, css) => {
        if (err) {
          console.error('CSS build error:', err)
          reject(err)
        }
        fs.writeFileSync(paths.css.out, css)
        resolve(css)
      })
  })
}

function copyHtml () {
  return fs.promises.copyFile(paths.html.entry, paths.html.out)
}


buildJS()
buildCSS()
copyHtml()
