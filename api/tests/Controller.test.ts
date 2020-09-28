import moment from 'moment'
import uuid4 from 'uuid4'
import request from './request'

describe('ControllerTest', () => {
  let restaurantId = null
  let inventoryId = null
  const restaurantName = uuid4()

  describe('RestaurantController', () => {
    it('should create a new restaurant and return it', async done => {
      const response = await request
        .post('/restaurants')
        .send({
          name: restaurantName,
          address: 'My Address',
        })
        .expect('Content-Type', /json/)
        .expect(200)
      restaurantId = response.body.id
      expect(response.body.name).toBe(restaurantName)
      expect(response.body.address).toBe('My Address')
      done()
    })

    it('should return a 400 when no data is given to create a restaurant', async done => {
      await request.post('/restaurants').send({}).expect(400)
      done()
    })

    it('should not create a new restaurant for one that already exists', async done => {
      await request
        .post('/restaurants')
        .send({
          name: restaurantName,
          address: 'My Address',
        })
        .expect(400)
      done()
    })

    it('should return all restaurants', async done => {
      const response = await request.get('/restaurants').expect('Content-Type', /json/).expect(200)
      expect(response.body.length).toBeGreaterThan(0)
      let foundCreatedRestaurant = false
      response.body.forEach(restaurant => {
        if (restaurant.id === restaurantId) {
          foundCreatedRestaurant = true
          expect(restaurant.name).toBe(restaurantName)
          expect(restaurant.address).toBe('My Address')
        }
      })

      expect(foundCreatedRestaurant).toBe(true)

      done()
    })

    it('should store a new inventory for the given restaurant', async done => {
      const response = await request
        .post(`/restaurants/${restaurantId}/inventory`)
        .send({
          start: 5,
          end: 10,
          maxReservations: 5,
        })
        .expect('Content-Type', /json/)
        .expect(200)
      inventoryId = response.body.id
      expect(response.body.start).toBe(5)
      expect(response.body.end).toBe(10)
      expect(response.body.maxReservations).toBe(5)
      expect(response.body.restaurantId).toBe(restaurantId)
      done()
    })

    it('should return a 404 when creating an inventory for a restaurant that does not exist', async done => {
      await request
        .post(`/restaurants/999999/inventory`)
        .send({
          start: 5,
          end: 10,
          maxReservations: 5,
        })
        .expect(404)
      done()
    })

    it('should return a 400 when creating an inventory with invalid data', async done => {
      const url = `/restaurants/${restaurantId}/inventory`
      // No Data
      await request.post(url).send({}).expect(400)

      // fail when having start greater than or equal to end
      await request
        .post(url)
        .send({
          start: 15,
          end: 15,
          maxReservations: 5,
        })
        .expect(400)

      // Fail when having 0 max reservations
      await request
        .post(url)
        .send({
          start: 15,
          end: 20,
          maxReservations: 0,
        })
        .expect(400)

      // Fail when trying to create inventory where start intersects with existing inventory
      await request
        .post(url)
        .send({
          start: 7,
          end: 20,
          maxReservations: 1,
        })
        .expect(400)

      // Fail when trying to create inventory where end intersects with existing inventory
      await request
        .post(url)
        .send({
          start: 1,
          end: 6,
          maxReservations: 1,
        })
        .expect(400)

      done()
    })

    it('returns all inventories created for the restaurant', async done => {
      const response = await request
        .get(`/restaurants/${restaurantId}/inventory`)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.length === 1)
      const inventory = response.body[0]
      expect(inventory.id).toBe(inventoryId)
      expect(inventory.restaurantId).toBe(restaurantId)
      expect(inventory.start).toBe(5)
      expect(inventory.end).toBe(10)
      expect(inventory.maxReservations).toBe(5)

      done()
    })
  })

  describe('InventoryController', () => {
    let reservationId = null

    it('should return a single inventory', async done => {
      const response = await request
        .get(`/inventory/${inventoryId}`)
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body.id).toBe(inventoryId)
      expect(response.body.start).toBe(5)
      expect(response.body.end).toBe(10)
      expect(response.body.maxReservations).toBe(5)
      done()
    })

    it('should return 404 when retrieving an inventory that does not exist', async done => {
      await request.get(`/inventory/9999`).expect(404)
      done()
    })

    it('should store a new reservation', async done => {
      const response = await request
        .post(`/inventory/${inventoryId}/reservations`)
        .send({
          name: 'Bob',
          email: 'bob@gmail.com',
          size: 3,
          date: moment().set('hour', 5).set('minute', 2).toDate(),
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.name).toBe('Bob')
      expect(response.body.email).toBe('bob@gmail.com')
      expect(response.body.size).toBe(3)
      expect(moment(response.body.date).hours()).toBe(5)
      expect(moment(response.body.date).minutes()).toBe(15)
      expect(response.body.inventoryId).toBe(inventoryId)

      done()
    })

    it('should return a 400 when storing a reservation that is invalid', async done => {
      // No size
      await request
        .post(`/inventory/${inventoryId}/reservations`)
        .send({
          name: 'Bob',
          email: 'bob@gmail.com',
          size: 0,
          date: moment().set('hour', 5).set('minute', 2).toDate(),
        })
        .expect(400)

      // invalid email
      await request
        .post(`/inventory/${inventoryId}/reservations`)
        .send({
          name: 'Bob',
          email: 'bob',
          size: 3,
          date: moment().set('hour', 5).set('minute', 2).toDate(),
        })
        .expect('Content-Type', /json/)
        .expect(400)

      done()
    })

    it('should return the new reservation with the associated inventory', async done => {
      const response = await request
        .get(`/restaurants/${restaurantId}/inventory`)
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body.length).toBeGreaterThan(0)
      const inventory = response.body[0]
      expect(inventory.reservations.length).toBe(1)
      const reservation = inventory.reservations[0]
      expect(reservation.name).toBe('Bob')
      done()
    })
  })
})
