import * as http from 'http'
import * as bodyParser from 'body-parser'
import morgan from 'morgan'
import { Server } from '@overnightjs/core'
import cors from 'cors'
import * as controllers from './controllers/index'
import Logger from './logger'
import { Request, Response, NextFunction } from 'express'
import { ValidationError, ValidationErrorItem } from 'sequelize'

interface ErrorBag {
  [field: string]: string[]
}

export class RouterServer extends Server {
  private server: http.Server

  constructor() {
    super(process.env.NODE_ENV === 'development')
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(
      cors({
        origin: '*',
      })
    )
    this.app.use(morgan('combined'))
    this.setupControllers()

    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof ValidationError) {
        res.status(400).json(this.validationErrorToMap(error))
      } else {
        console.error(error)
        res.status(500).json('Internal Server Error!')
      }
    })
  }

  /**
   * Transforms the given ValidationError instance to an object where
   * the key is the field with the error, and the value is an array of errors.
   *
   * @param error
   */
  private validationErrorToMap(error: ValidationError): ErrorBag {
    const errorBag: ErrorBag = {}
    error.errors.forEach((error: ValidationErrorItem) => {
      if (!errorBag[error.path]) {
        errorBag[error.path] = []
      }
      errorBag[error.path].push(error.message)
    })
    return errorBag
  }

  private setupControllers(): void {
    type Controllers = {}
    const ctlrInstances: any = []

    for (const ctrlName in controllers) {
      if (controllers.hasOwnProperty(ctrlName)) {
        const controller = new (<Controllers>controllers)[ctrlName]()
        ctlrInstances.push(controller)
      } else {
        Logger.error(`${ctrlName} does not exist`)
      }
    }
    return super.addControllers(ctlrInstances)
  }

  public start(port: number): void {
    this.server = this.app.listen(port, () => {
      Logger.info(`Server listening on port: ${port}`)
    })
  }

  public stop(): void {
    this.server.close()
  }
}
