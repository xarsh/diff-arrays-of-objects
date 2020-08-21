export default {
  input: './lib/index.js',
  output: {
    exports: 'auto',
    moduleName: 'diff',
    format: ['esm'],
    dir: 'dist'
  }
}
