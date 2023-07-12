import card from './src/card.vue'

const myCard = {
  install(app, options) {
    app.component(card.name, card)
  }
}

export default myCard
