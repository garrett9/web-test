import moment, { Moment } from 'moment'
import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  IsEmail,
  Length,
  IsInt,
  IsAfter,
  NotEmpty,
  Min,
  Max,
  ForeignKey,
  Index,
} from 'sequelize-typescript'
import { Restaurant } from './Restaurant'
import { Inventory } from './Inventory'

const REQUIRED_FIELD = { msg: 'This field is required.' }

@Table({ tableName: 'reservations' })
export class Reservation extends Model<Reservation> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      notEmpty: REQUIRED_FIELD,
      max: 255,
    },
  })
  name: string

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      notEmpty: REQUIRED_FIELD,
      max: 255,
      isEmail: true,
    },
  })
  email: string

  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      notEmpty: REQUIRED_FIELD,
      max: 200,
      min: 1,
      isInt: true,
    },
  })
  size: number

  @Index
  @Column({
    allowNull: false,
    validate: {
      notNull: REQUIRED_FIELD,
      isDate: true,
      isAfter: moment().format('YYYY-MM-DD'),
    },
  })
  public get date(): Date {
    return this.getDataValue('date')
  }

  public set date(date: Date) {
    // Round the given date up to the nearest 15 minute interval
    const momentDate = moment(date)
    const remainder = 15 - (momentDate.minute() % 15)
    this.setDataValue(
      'date',
      momentDate
        .clone()
        .add(remainder === 15 ? 0 : remainder, 'minute')
        .toDate()
    )
  }

  @ForeignKey(() => Inventory)
  @Column({
    allowNull: false,
  })
  inventoryId: number

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}
