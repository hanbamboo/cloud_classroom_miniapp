import Vue from 'vue'
import App from './App'
import store from './store' // store
import plugins from './plugins' // plugins

import uView from '@/uni_modules/uview-ui'
import './permission' // permission
Vue.use(plugins)
Vue.use(uView)

Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
