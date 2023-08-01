import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import myAffix from './components/affix'
import myCard from './components/card'
import myScrollbar from './components/scrollbar'
import icon from './components/icon'
import myButton from './components/button'
import formObj from './components/form'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(myAffix).use(myCard).use(myScrollbar).use(icon).use(myButton).use(formObj.myForm).use(formObj.myFormItem)
app.mount('#app')
