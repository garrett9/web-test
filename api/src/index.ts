require('source-map-support/register')
import { Sequelize } from 'sequelize-typescript'
import { RouterServer } from './RouterServer'
import * as models from './models'

const server = new RouterServer()
server.start(8080)
;(async () => {
  const sequelize = new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
    dialect: 'postgres',
    logging: process.env.LOG === 'debug' ? console.log : false,
    models: Object.keys(models).map(k => models[k]),
  })

  await sequelize.sync({
    alter: true,
  })
})()

export default server
