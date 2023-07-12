import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import myAffix from './components/affix'
import myCard from './components/card'

const app = createApp(App)
app.use(myAffix).use(myCard)
app.mount('#app')
