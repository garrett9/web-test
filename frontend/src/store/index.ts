import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

let restaurant: any = null

if (localStorage.restaurant) {
  try {
    restaurant = JSON.parse(localStorage.restaurant)
  } catch (error) {
    console.error('Failed to parse stored restaurant!')
    delete localStorage.restaurant
  }
}

export default new Vuex.Store({
  state: {
    restaurant
  },

  getters: {
    /**
     * Return the ID of the restaurant the user is currently using.
     */
    restaurantId: state => {
      return state.restaurant ? state.restaurant.id : null
    }
  },

  mutations: {
    /**
     * Set the restaurant the user is currently using.
     *
     * @param state
     * @param restaurant
     */
    setRestaurant(state, restaurant: object) {
      state.restaurant = restaurant
      localStorage.restaurant = JSON.stringify(restaurant)
    }
  }
})
