import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.config.productionTip = false

axios.defaults.baseURL = 'http://localhost:8080'

router.beforeEach((to, from, next) => {
  if (!store.getters.restaurantId && to.name !== 'restaurants.create') {
    next({ name: 'restaurants.create' })
  } else {
    next()
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
