import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript'
import { Reservation } from './Reservation'
import { Inventory } from './Inventory'
import { NextFunction } from 'express'

const REQUIRED_FIELD = { msg: 'This field is required.' }

@Table({ tableName: 'restaurants' })
export class Restaurant extends Model<Restaurant> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column({
    allowNull: false,
    validate: {
      notEmpty: REQUIRED_FIELD,
      notNull: REQUIRED_FIELD,
      async isUnique(value: any, next: NextFunction) {
        try {
          const restaurant = await Restaurant.findOne({ where: { name: value } })
          if (!restaurant) {
            next()
          }
        } catch (error) {}
        next('This restaurant already exists.')
      },
    },
    unique: true,
  })
  name: string

  @Column({
    allowNull: false,
    validate: {
      notEmpty: REQUIRED_FIELD,
      notNull: REQUIRED_FIELD,
    },
  })
  address: string

  @HasMany(() => Inventory)
  inventories: Inventory[]

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}
