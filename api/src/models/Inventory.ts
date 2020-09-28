import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript'
import { Restaurant } from './Restaurant'
import { Reservation } from './Reservation'
import { NextFunction } from 'express'
import { Op } from 'sequelize'

const REQUIRED_FIELD = { msg: 'This field is required.' }

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      min: 0,
      max: 23,
      isInt: true,
      async lessThanEnd(value: any, next: NextFunction) {
        if (value >= this.end) {
          next('Must be less than the end time.')
        } else {
          next()
        }
      },
      async isUniqueStart(value: any, next: NextFunction) {
        try {
          const inventory = await Inventory.findAll({
            where: {
              restaurantId: this.restaurantId,
              start: {
                [Op.lte]: value,
              },
              end: {
                [Op.gt]: value,
              },
            },
          })
          if (inventory.length <= 0) {
            next()
          }
        } catch (error) {}
        next('There already exists an inventory that intersects with this start time.')
      },
    },
  })
  start: number

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      min: 0,
      max: 24,
      isInt: true,
      async isUniqueEnd(value: any, next: NextFunction) {
        try {
          const inventory = await Inventory.findAll({
            where: {
              restaurantId: this.restaurantId,
              start: {
                [Op.lte]: value,
              },
              end: {
                [Op.gt]: value,
              },
            },
          })
          if (inventory.length <= 0) {
            next()
          }
        } catch (error) {}
        next('There already exists an inventory that intersects with this end time.')
      },
    },
  })
  end: number

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      min: 1,
      max: 200,
      isInt: true,
    },
  })
  maxReservations: number

  @ForeignKey(() => Restaurant)
  @Column({
    allowNull: false,
  })
  restaurantId: number

  @HasMany(() => Reservation)
  reservations: Reservation[]

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}
