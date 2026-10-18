
export const fastifyLoggerController = {
subPath:`LoggerController.ts`,
file: `import type { FastifyRequest, FastifyReply } from 'fastify'
import { type LoggerServiceDb } from './LoggerServiceDb.js'
import { type IPagesOptions, type ILogger } from './Logger.interfaces.js'

export class LoggerController {
  protected service: LoggerServiceDb

  constructor(service: LoggerServiceDb) {
    this.service = service
  }

  getAll = async(request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as IPagesOptions<ILogger>
    const { info, data } = await this.service.getAll(query)
    return reply.status(200).send({ message: 'OK', data: { info, data } })
  }

  getById = async(request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const results = await this.service.getById(id)
    return reply.status(200).send({ message: 'OK', data:results })
  }

  update = async(request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const newData = request.body as Pick<ILogger, 'keep'>
    const { message, data } = await this.service.update(id, newData)
    return reply.status(200).send({ message, data })
  }

  delete = async(request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = await this.service.delete(id)
    return reply.status(200).send({ data })
  }

  deleteAll = async(request: FastifyRequest, reply: FastifyReply) => {
    const response = await this.service.deleteAll()
    return reply.status(200).send({ data: response })
  }
}`
}
