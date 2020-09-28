<template>
  <div>
    <app-form @submit="create()" :errors="errors">
      <app-card header="Create a New Reservation">
        <app-form-group label="Name">
          <input
            type="text"
            name="name"
            class="form-control"
            placeholder="Name"
            autofocus
            required
            v-model="model.name"
          />
        </app-form-group>
        <app-form-group label="Address">
          <input
            type="text"
            class="form-control"
            name="address"
            placeholder="Address"
            required
            v-model="model.address"
          />
        </app-form-group>
        <div class="form-group row">
          <div class="col-sm-12 col-md-6 offset-md-3">
            <app-submit :loading="loading">Create</app-submit>
          </div>
        </div>
      </app-card>
    </app-form>
  </div>
</template>

<script>
import axios from 'axios'
import AppCard from '../components/AppCard'
import AppForm from '../components/AppForm'
import AppFormGroup from '../components/AppFormGroup'
import AppSubmit from '../components/AppSubmit'
import EventBus from '../EventBus'

export default {
  name: 'CreateRestaurant',

  components: {
    AppCard,
    AppForm,
    AppFormGroup,
    AppSubmit
  },

  data() {
    return {
      model: {},
      loading: false,
      errors: {}
    }
  },

  methods: {
    async create() {
      this.loading = true
      try {
        const restaurant = (await axios.post('/restaurants', this.model)).data
        EventBus.$emit('restaurants.new', restaurant)
        this.$store.commit('setRestaurant', restaurant)
        this.$router.push({ name: 'inventory' })
      } catch (error) {
        if (error.response.status === 400) {
          this.errors = error.response.data
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
