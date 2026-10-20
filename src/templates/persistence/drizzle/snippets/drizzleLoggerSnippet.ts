export const loggerServiceDbDrizzle ={
  importType:`'../../schemas/log.schema.js'`,
  file:`import { throwError, processError, ERROR_CODE } from '../errors.js'
import { eq, ilike, desc, asc, count, getTableColumns, type Column, type SQL, type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core'
import {
  type ILogger,
  type LoggerUpdate,
  type LoggerCreate,
  type ILoggerService,
  type IPagesOptions,
  type IActionResponse,
  type IPaginatedResponse
} from './Logger.interfaces.js'
import { db } from '../database.js'
import { log, LogLevel } from '../../schemas/index.schemas.js'

type LogSelect = InferSelectModel<typeof log>
type LogInsert = InferInsertModel<typeof log>

class LoggerServiceDb implements ILoggerService<ILogger, LoggerUpdate> {
  constructor() {}

  /**
   * Parse Drizzle row → ILogger
   */
  private readonly parserFn = (u: LogSelect): ILogger => {
    return {
      id: u.id,
      levelName: u.levelName ?? '',
      levelCode: Number(u.levelCode ?? 0),
      message: u.message ?? '',
      type: u.type ?? null,
      status: u.status != null ? Number(u.status) : null,
      stack: u.stack ?? null,
      contexts: u.contexts ?? [],
      pid: Number(u.pid ?? 0),
      time: Number(u.time ?? 0),
      hostname: u.hostname ?? '',
      keep: Boolean(u.keep),
      createdAt: u.createdAt ? u.createdAt.toISOString() : undefined,
      updatedAt: u.updatedAt ? u.updatedAt.toISOString() : undefined
    }
  }

  /**
   * Create new log record
   */
  async create(data: LoggerCreate): Promise<ILogger> {
    try {
      const [record] = await db
        .insert(log)
        .values(data as unknown as LogInsert)
        .returning()

      if (!record) {
        throwError(ERROR_CODE.INTERNAL_ERROR, 'Error creating log record')
      }

      return this.parserFn(record)
    } catch (error) {
      return processError(error, 'Log create')
    }
  }

  /**
   * Get paginated results
   */
  async getAll(options: IPagesOptions<ILogger> = {}): Promise<IPaginatedResponse> {
    try {
      const {
        searchField = '',
        search = null,
        sortBy = 'id',
        order = 'DESC',
        page = 1,
        limit = 10
      } = options

      const offset = (page - 1) * limit

      let whereClause: SQL | undefined = undefined
      const dbSearchField = String(searchField)
      const dbSortField = String(sortBy)

      const columns = getTableColumns(log)

      if (search && dbSearchField && dbSearchField in columns) {
        const searchCol = columns[dbSearchField as keyof typeof columns]
        whereClause = ilike(searchCol as Column, \`%\${search}%\`)
      }

      // Query para obtener el total
      const totalQuery = await db
        .select({ count: count() })
        .from(log)
        .where(whereClause)

      const total = Number(totalQuery[0]?.count ?? 0)

      // Query para obtener los resultados
      const orderDirection = order.toUpperCase() === 'ASC' ? asc : desc
      const sortColumn = (dbSortField in columns
        ? columns[dbSortField as keyof typeof columns]
        : columns.id) as Column

      const existingRecords = await db
        .select()
        .from(log)
        .where(whereClause)
        .orderBy(orderDirection(sortColumn))
        .limit(limit)
        .offset(offset)

      return {
        info: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        data: existingRecords.map((record) => this.parserFn(record))
      }
    } catch (error) {
      return processError(error, 'LoggerServiceDb getAll')
    }
  }

  /**
   * Get single log by ID
   */
  async getById(id: string): Promise<ILogger> {
    try {
      const records = await db
        .select()
        .from(log)
        .where(eq(log.id, id))
        .limit(1)
      const record = records[0]

      if (!record) {
        throwError(ERROR_CODE.NOT_FOUND, \`Log con logId \${id} no encontrado\`)
      }

      return this.parserFn(record)
    } catch (error) {
      return processError(error, 'LoggerServiceDb getById')
    }
  }

  /**
   * Update keep flag or other allowed fields
   */
  async update(id: string, data: LoggerUpdate): Promise<IActionResponse> {
    try {
      const records = await db
        .update(log)
        .set(data as PgUpdateSetSource<typeof log>)
        .where(eq(log.id, id))
        .returning()

      const record = records[0]

      if (!record) {
        throwError(ERROR_CODE.NOT_FOUND, \`Log con logId \${id} no encontrado\`)
      }

      return {
        message: 'Log actualizado correctamente',
        data: this.parserFn(record)
      }
    } catch (error) {
      return processError(error, 'LoggerServiceDb update')
    }
  }

  /**
   * Delete single log
   */
  async delete(id: string): Promise<string> {
    try {
      const records = await db
        .delete(log)
        .where(eq(log.id, id))
        .returning()

      if (records.length === 0) {
        throwError(ERROR_CODE.NOT_FOUND, \`Log con logId \${id} no encontrado\`)
      }

      return 'Log eliminado correctamente'
    } catch (error) {
      return processError(error, 'Log deleted')
    }
  }

  /**
   * Delete all logs except those marked as keep = true
   */
  async deleteAll(): Promise<string | void> {
    try {
      await db
        .delete(log)
        .where(eq(log.keep, false))

      return 'Logs eliminados correctamente'
    } catch (error) {
      return processError(error, 'LoggerServiceDb deleteAll')
    }
  }
}
const loggerServiceDb = new LoggerServiceDb()

export {
  LoggerServiceDb,
  loggerServiceDb,
  LogLevel
}`}