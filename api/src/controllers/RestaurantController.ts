import moment from 'moment'
import { Op } from 'sequelize'
import asyncHandler from 'express-async-handler'
import { ClassWrapper } from '@overnightjs/core'
import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventory, Restaurant, Reservation } from '../models'

@ClassWrapper(asyncHandler)
@Controller('restaurants')
export class RestaurantController {
  /**
   * Get all restaurants.
   *
   * @param req
   * @param res
   */
  @Get('')
  private async get(req: Request, res: Response) {
    return res.json(await Restaurant.findAll())
  }

  /**
   * Store a new restaurant.
   *
   * @param req
   * @param res
   */
  @Post('')
  private async store(req: Request, res: Response) {
    const restaurant = new Restaurant(req.body)
    await restaurant.save()
    return res.json(restaurant)
  }

  /**
   * Get all of the inventories for the given restaurant.
   *
   * @param req
   * @param res
   */
  @Get(':id/inventory')
  private async inventories(req: Request, res: Response) {
    const date = req.query.date ? moment(req.query.date.toString(), ['MM/DD/YYYY']) : moment()
    const restaurant = await Restaurant.findByPk(req.params.id)
    if (restaurant) {
      return res.json(
        await Inventory.findAll({
          where: { restaurantId: restaurant.id },
          include: [
            {
              model: Reservation,
              where: {
                date: {
                  [Op.gte]: date.toDate(),
                  [Op.lt]: date.add(1, 'day').toDate(),
                },
              },
              required: false,
            },
          ],
        })
      )
    }
    return res.sendStatus(404)
  }

  /**
   * Store a new inventory for a given restaurant.
   *
   * @param req
   * @param res
   */
  @Post(':id/inventory')
  private async storeInventory(req: Request, res: Response) {
    const restaurant: Restaurant = await Restaurant.findByPk(req.params.id)
    if (restaurant) {
      const inventory = new Inventory(req.body)
      inventory.restaurantId = restaurant.id
      await inventory.save()
      return res.json(inventory)
    }
    return res.sendStatus(404)
  }
}
