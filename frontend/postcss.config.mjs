import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    autoprefixer({
      overrideBrowserslist: [
        'Safari >= 13',
        'last 2 versions',
        '> 1%'
      ]
    })
  ]
}
