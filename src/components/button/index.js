import button from './src/button.vue'

const myButton = {
  install(app, options) {
    app.component(button.name, button)
  }
}

export default myButton
