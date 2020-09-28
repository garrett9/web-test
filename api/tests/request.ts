import server from '../src/index'
import request from 'supertest'
import { Restaurant } from '../src/models'

export default request(server.app)
