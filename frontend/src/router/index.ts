import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import CreateInventory from '../views/CreateInventory.vue'
import CreateRestaurant from '../views/CreateRestaurant.vue'
import CreateReservation from '../views/CreateReservation.vue'
import Reservations from '../views/Reservations.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: 'inventory'
  },
  {
    path: '/restaurants/create',
    name: 'restaurants.create',
    component: CreateRestaurant
  },
  {
    path: '/inventory',
    name: 'inventory',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Inventory.vue')
  },
  {
    path: '/inventory/create',
    name: 'inventory.create',
    component: CreateInventory
  },
  {
    path: '/inventory/:id/reservations/create',
    name: 'inventory.reservations.create',
    component: CreateReservation
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
