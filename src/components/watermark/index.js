import watermark from './src/watermark.vue'

const myWatermark = {
  install(app, options) {
    app.component(watermark.name, watermark)
  }
}

export default myWatermark
