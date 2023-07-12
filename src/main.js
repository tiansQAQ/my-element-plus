import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import myAffix from './components/affix'
import myCard from './components/card'
import myScrollbar from './components/scrollbar'

const app = createApp(App)
app.use(myAffix).use(myCard).use(myScrollbar)
app.mount('#app')
