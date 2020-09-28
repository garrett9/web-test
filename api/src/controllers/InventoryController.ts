import asyncHandler from 'express-async-handler'
import { Controller, Get, Post, ClassWrapper } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventory } from '../models/Inventory'
import { Reservation } from '../models'

@ClassWrapper(asyncHandler)
@Controller('inventory')
export class InventoryController {
  @Get(':id')
  private async find(req: Request, res: Response) {
    const inventory = await Inventory.findByPk(req.params.id)
    if (inventory) {
      return res.json(inventory)
    }
    return res.sendStatus(404)
  }

  /**
   * Store a new reservation for the given
   * @param req
   * @param res
   */
  @Post(':id/reservations')
  private async storeReservation(req: Request, res: Response) {
    const inventory = await Inventory.findByPk(req.params.id)
    if (inventory) {
      const reservation = new Reservation(req.body)
      reservation.inventoryId = inventory.id

      // check to see if the maximum number of reservations has been created for the time frame.
      //
      // NOTE: This solution would have to be fixed in a real environment since it's possible
      // we could potentially create a reservation even though we hit the max reservations allowed.
      // To fix this, some type of locking mechanism would need to be implemented (either opportunistic or
      // pessimistic)
      const reservations = await Reservation.findAll({
        where: {
          date: reservation.date,
        },
      })
      if (reservations.length >= inventory.maxReservations) {
        return res.sendStatus(403)
      }

      await reservation.save()
      return res.json(reservation)
    }
    return res.sendStatus(404)
  }
}
