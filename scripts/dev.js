const bs = require('browser-sync').create()
const historyApiFallback = require('connect-history-api-fallback')
const { buildJS, buildCSS, copyHtml, copyStatic } = require('./build')

// serve
bs.init({
  port: 7777,
  open: false,
  server: './public',
  files: './public/*',
  ui: false,
  middleware: [historyApiFallback()]
})

// watch changes
bs.watch('src/index.html', copyHtml)
bs.watch('src/assets/**/*.*', copyStatic)
bs.watch('src/**/*.styl', buildCSS)
bs.watch('src/**/*.(js|ts)', buildJS)
