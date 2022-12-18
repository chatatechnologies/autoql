const browserify = require('browserify')

browserify()
  .transform('sheetify/transform')
  .plugin('css-extract', { out: 'bundle.css' })
  .bundle()
