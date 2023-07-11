import Affix from './src/affix.vue'

const myAffix = {
  install(app, options) {
    app.component(Affix.name, Affix)
  }
}

export default myAffix
