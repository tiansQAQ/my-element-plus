import icon from './src/icon.vue'

const myIcon = {
  install(app, options) {
    app.component(icon.name, icon)
  }
}

export default myIcon
