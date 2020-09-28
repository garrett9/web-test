<template>
  <div>
    <h1>Inventory</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="!inventory" class="text-danger">
      Could not load your inventory!
    </div>
    <div v-else-if="inventory.length <= 0">
      <p>Your restaurant has no inventory yet.</p>
      <div>
        <router-link
          :to="{ name: 'inventory.create' }"
          class="btn btn-secondary"
          >Create Inventory</router-link
        >
      </div>
    </div>
    <div v-else id="accordion" class="accordion">
      <div class="row">
        <div class="col-sm-12 col-md-4">
          <app-form-group :fullWidth="true" label="Date">
            <select
              class="form-control"
              name="date"
              required
              v-model="currentDate"
              @change="dateChanged(currentDate)"
            >
              <option v-for="date in dates" :key="date" :value="date">
                {{ date }}
              </option>
            </select></app-form-group
          >
        </div>
      </div>
      <div class="card" v-for="item in inventory" :key="item.id">
        <div
          class="card-header text-white bg-dark"
          data-toggle="collapse"
          :data-target="`#collapse-${item.id}`"
        >
          {{ inventoryHeader(item) }}
          <router-link
            :to="{
              name: 'inventory.reservations.create',
              params: { id: item.id },
              query: { date: currentDate }
            }"
            class="btn btn-sm btn-secondary float-right"
          >
            Create Reservation
          </router-link>
        </div>
        <div
          class="collapse"
          :id="`collapse-${item.id}`"
          data-parent="#accordion"
        >
          <div class="card-body">
            <table class="table table-borderless">
              <thead>
                <tr>
                  <th>Time</th>
                  <th class="text-right">Reservations</th>
                  <th class="text-right">Reservations Allowed</th>
                  <th class="text-center"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(reservations, time) in item.reservationMap"
                  :key="time"
                >
                  <td>{{ time }}</td>
                  <td class="text-right">{{ reservations.length }}</td>
                  <td class="text-right">{{ item.maxReservations }}</td>
                  <td class="text-center">
                    <button
                      :disabled="reservations.length <= 0"
                      class="btn btn-link btn-sm"
                      @click="openReservations(reservations, time)"
                    >
                      View Reservations
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="view-reservations-modal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Viewing Reservations for {{ viewReservations.time }} on
              {{ currentDate }}
            </h5>
            <button type="button" class="close" data-dismiss="modal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <table class="table table-borderless">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th class="text-right">Party Size</th>
                  <th class="text-right">Created On</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="reservation in viewReservations.reservations"
                  :key="reservation.id"
                >
                  <td>{{ reservation.name }}</td>
                  <td>
                    <a :href="`mailto:${reservation.email}`">{{
                      reservation.email
                    }}</a>
                  </td>
                  <td class="text-right">{{ reservation.size }}</td>
                  <td class="text-right">
                    {{ dateFormat(reservation.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-header {
  cursor: pointer;
  line-height: 2rem;
}

.card-body {
  max-height: 400px;
  overflow-y: auto;
}
</style>

<script>
import $ from 'jquery'
import * as moment from 'moment'
import axios from 'axios'

import AppFormGroup from '../components/AppFormGroup'

export default {
  name: 'Inventory',

  components: {
    AppFormGroup
  },

  data() {
    const dates = []
    for (let i = 0, date = moment(); i <= 10; i++, date.add(1, 'day')) {
      dates.push(date.format('MM/DD/YYYY'))
    }

    return {
      dates,
      currentDate: this.$route.query.date || dates[0],
      loading: true,
      inventory: null,
      viewReservations: {}
    }
  },

  watch: {
    $route(to) {
      this.loadInventory(to.query.date)
    }
  },

  created() {
    this.loadInventory(this.$route.query.date)
  },

  methods: {
    /**
     * Load the inventory for the page.
     */
    async loadInventory(date) {
      if (!date) {
        date = moment().format('MM/DD/YYYY')
      } else {
        date = moment(date, ['MM/DD/YYYY']).format('MM/DD/YYYY')
      }
      try {
        this.inventory = (
          await axios.get(
            `/restaurants/${this.$store.getters.restaurantId}/inventory`,
            { params: { date } }
          )
        ).data
        this.inventory.forEach(item => {
          item.reservationMap = {}
          const start = moment()
            .set('hour', item.start)
            .set('minute', 0)
          const end = start.clone().set('hour', item.end === 24 ? 0 : item.end)
          if (item.end === 24) {
            end.add(1, 'day')
          }
          for (; start.isBefore(end); start.add(15, 'minute')) {
            item.reservationMap[start.format('h:mm A')] = []
          }

          item.reservations.forEach(reservation => {
            const reservationDate = moment(reservation.date)
            item.reservationMap[reservationDate.format('h:mm A')].push(
              reservation
            )
          })
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    /**
     * React when the date filter has changed.
     */
    dateChanged(date) {
      this.$router.push({ name: 'inventory', query: { date } })
    },

    /**
     * Open the reservations for a given inventory item.
     */
    openReservations(reservations, time) {
      this.viewReservations = {
        reservations,
        time
      }
      $('#view-reservations-modal').modal('show')
    },

    /**
     * Return the header for an inventory item.
     *
     * @param inventory
     */
    inventoryHeader(inventory) {
      const start = moment()
        .set('hour', inventory.start)
        .format('h:00 A')
      const end =
        moment()
          .set('hour', inventory.end)
          .format(`h:00 A`) + ` ${inventory.end === 24 ? '(Next Day)' : ''}`

      return `Inventory from ${start} to ${end}`
    },

    dateFormat(date) {
      return moment(date).format('MM/DD/YYYY h:mmA')
    }
  }
}
</script>
