import scrollbar from './src/scrollbar.vue'

const myScrollbar = {
  install(app, options) {
    app.component(scrollbar.name, scrollbar)
  }
}

export default myScrollbar
