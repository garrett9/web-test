<template>
  <div>
    <app-form @submit="create()" :errors="errors">
      <app-card header="Create Inventory">
        <app-form-group label="Start Time">
          <select v-model="model.start" name="start" class="form-control">
            <option
              v-for="time in times"
              :key="time.value"
              :value="time.value"
              >{{ time.display }}</option
            >
          </select>
        </app-form-group>
        <app-form-group label="End Time">
          <select v-model="model.end" name="end" class="form-control">
            <option
              v-for="time in times"
              :key="time.value"
              :value="time.value"
              >{{ time.display }}</option
            >
          </select>
        </app-form-group>
        <app-form-group label="Reservations">
          <input
            type="number"
            class="form-control"
            name="reservations"
            placeholder="Reservations"
            required
            min="0"
            max="200"
            v-model="model.maxReservations"
          />
          <div class="form-text text-muted">
            The maximum number of reservations allowed every 15 minutes.
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
  name: 'CreateInventory',

  components: {
    AppCard,
    AppForm,
    AppFormGroup,
    AppSubmit
  },

  data() {
    const times = []
    for (
      let i = 0, date = moment().set('hour', 0);
      i <= 24;
      i++, date.add(1, 'hour')
    ) {
      times.push({
        value: i,
        display: date.format('h:00 A')
      })
    }

    times[times.length - 1].display += ' (Next Day)'

    return {
      times,
      errors: {},
      loading: false,
      model: {
        start: times[0].value,
        end: times[1].value
      }
    }
  },

  methods: {
    async create() {
      this.loading = true
      try {
        await axios.post(
          `restaurants/${this.$store.state.restaurant.id}/inventory`,
          this.model
        )
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
