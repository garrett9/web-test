<template>
  <div>
    <div v-if="!inventory">Loading...</div>
    <app-form @submit="create()" :errors="errors" v-else>
      <app-card
        :header="
          `Create a New Reservation between ${inventory.startDisplay} to ${
            inventory.endDisplay
          } ${$route.query.date ? `on ${model.date}` : ''}`
        "
      >
        <app-form-group label="Name">
          <input
            type="text"
            name="name"
            class="form-control"
            placeholder="Name"
            required
            autofocus
            v-model="model.name"
          />
        </app-form-group>
        <app-form-group label="Email Address">
          <input
            type="email"
            class="form-control"
            name="email"
            placeholder="Email Address"
            required
            v-model="model.email"
          />
        </app-form-group>
        <app-form-group label="Party Size">
          <select
            class="form-control"
            name="size"
            required
            v-model="model.size"
          >
            <option v-for="size in partySizes" :key="size" :value="size">{{
              size
            }}</option>
          </select>
        </app-form-group>
        <app-form-group label="Date">
          <div class="row">
            <div class="col-sm-12 col-md-7">
              <select
                class="form-control"
                name="date"
                :disabled="$route.query.date"
                required
                v-model="model.date"
              >
                <option v-for="date in dates" :key="date" :value="date">
                  {{ date }}
                </option>
              </select>
            </div>
            <div class="col-sm-12 col-md-5">
              <select
                class="form-control"
                name="time"
                required
                v-model="model.time"
              >
                <option
                  v-for="time in times"
                  :key="time.value"
                  :value="time.value"
                  >{{ time.display }}</option
                >
              </select>
            </div>
          </div>
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
import * as moment from 'moment'
import axios from 'axios'
import AppCard from '../components/AppCard'
import AppForm from '../components/AppForm'
import AppFormGroup from '../components/AppFormGroup'
import AppSubmit from '../components/AppSubmit'

const MAX_PARTY_SIZE = 10

export default {
  name: 'CreateReservation',

  components: {
    AppCard,
    AppForm,
    AppFormGroup,
    AppSubmit
  },

  data() {
    const partySizes = []
    for (let i = 1; i <= MAX_PARTY_SIZE; i++) {
      partySizes.push(i)
    }

    const dates = []
    for (let i = 0, date = moment(); i <= 10; i++, date.add(1, 'day')) {
      dates.push(date.format('MM/DD/YYYY'))
    }

    return {
      partySizes,
      dates,
      inventory: null,
      times: [],
      model: {
        size: 2,
        date: this.$route.query.date
          ? moment(this.$route.query.date, ['MM/DD/YYYY']).format('MM/DD/YYYY')
          : dates[0]
      },
      loading: false,
      loadingPage: false,
      errors: {}
    }
  },

  watch: {
    $route: () => {
      this.loadInventory(this.$route.params.id)
    }
  },

  created() {
    this.loadInventory(this.$route.params.id)
  },

  methods: {
    /**
     * Load the inventory record for creating the reservation.
     */
    async loadInventory(id) {
      try {
        this.inventory = (await axios.get(`inventory/${id}`)).data
        this.inventory.startDisplay = moment()
          .set('hour', this.inventory.start)
          .set('minute', 0)
          .format('h:mm A')
        this.inventory.endDisplay = moment()
          .set('hour', this.inventory.end)
          .set('minute', 0)
          .format('h:mm A')

        const start = moment()
          .set('hour', this.inventory.start)
          .set('minute', 0)
        const end = start
          .clone()
          .set('hour', this.inventory.end === 24 ? 0 : this.inventory.end)
        if (this.inventory.end === 24) {
          end.add(1, 'day')
        }

        for (let i = 0; start.isBefore(end); i++, start.add(15, 'minute')) {
          this.times.push({
            value: i,
            display: start.format('h:mm A')
          })
        }

        this.model.time = this.times[0].value
      } catch (error) {
        console.error(error)
      }
    },

    async create() {
      this.loading = true

      const data = Object.assign({}, this.model)
      data.date = moment(data.date, ['MM/DD/YYYY'])
        .set({ hour: this.inventory.start, minute: 0, second: 0 })
        .add(data.time * 15, 'minute')

      try {
        await axios.post(`/inventory/${this.inventory.id}/reservations`, data)
        const route = { name: 'inventory' }
        if (this.$route.query.date) {
          route.query = { date: this.$route.query.date }
        }
        this.$router.push(route)
      } catch (error) {
        if (error.response.status === 400) {
          this.errors = error.response.data
        } else if (error.response.status === 403) {
          this.errors = {
            date: [
              'Maximum number of reservations for this date and time already have been met.'
            ]
          }
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
