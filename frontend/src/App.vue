<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link :to="{}" class="navbar-brand" href="#"
          >Garrett Web Test</router-link
        >
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li
              v-if="$store.getters.restaurantId"
              class="nav-item"
              :class="{ active: $route.name === 'inventory' }"
            >
              <router-link :to="{ name: 'inventory' }" class="nav-link"
                >Inventory</router-link
              >
            </li>
            <li
              v-if="$store.getters.restaurantId"
              class="nav-item"
              :class="{ active: $route.name === 'inventory.create' }"
            >
              <router-link :to="{ name: 'inventory.create' }" class="nav-link"
                >Create Inventory</router-link
              >
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
              >
                {{
                  $store.state.restaurant
                    ? $store.state.restaurant.name
                    : 'No Restaurant Selected'
                }}
              </a>
              <div class="dropdown-menu">
                <a
                  class="dropdown-item"
                  href="#"
                  @click="setRestaurant(restaurant)"
                  v-for="restaurant in restaurants"
                  :key="restaurant.id"
                  >{{ restaurant.name }}</a
                >
                <router-link
                  :to="{ name: 'restaurants.create' }"
                  class="dropdown-item"
                  >Create New Restaurant</router-link
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container mt-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import EventBus from './EventBus'

export default {
  data() {
    return {
      restaurants: null
    }
  },

  async created() {
    this.loadRestaurants()

    EventBus.$on('restaurants.new', restaurant => {
      this.restaurants.push(restaurant)
    })
  },

  methods: {
    /**
     * Load the restaurants for the application
     */
    async loadRestaurants() {
      try {
        this.restaurants = (await axios.get('/restaurants')).data
        if (this.restaurants.length <= 0) {
          this.$store.commit('setRestaurant', null)
        }

        if (!this.$store.state.restaurant && this.restaurants.length > 0) {
          this.$store.commit('setRestaurant', this.restaurants[0])
        }
      } catch (error) {
        console.error(error)
      }
    },

    /**
     * Set the current restaurant the user is using.
     */
    setRestaurant(restaurant) {
      if (restaurant.id !== this.$store.state.restaurant.id) {
        this.$store.commit('setRestaurant', restaurant)
        this.$router.go()
      }
    }
  }
}
</script>
