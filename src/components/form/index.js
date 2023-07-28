import Form from './src/form.vue'
import FormItem from './src/form-item.vue'

const obj = { myForm: Form, myFormItem: FormItem }

const exportObj = {}

Object.keys(obj).forEach((item) => {
  exportObj[item] = {
    install(app, options) {
      app.component(obj[item])
    }
  }
})

export default exportObj
