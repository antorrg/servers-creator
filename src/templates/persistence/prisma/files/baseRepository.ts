/**
 * baseRepository
 * baseRepositoryTest
 * baseRepositoryTestHelp
 */

export const baseRepository = `import type { IBaseRepository, IPaginatedOptions, IPaginatedResults } from '../interfaces/base.interface.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'

/**
 * Contrato base para los delegates generados por Prisma
 */
export interface IPrismaDelegate<TRecord = unknown> {
  findMany(args?: {
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
    skip?: number
    take?: number
  }): Promise<TRecord[]>
  findUnique(args: { where: Record<string, unknown> }): Promise<TRecord | null>
  findFirst(args?: { where?: Record<string, unknown> }): Promise<TRecord | null>
  create(args: { data: unknown }): Promise<TRecord>
  update(args: { where: Record<string, unknown>; data: unknown }): Promise<TRecord>
  delete(args: { where: Record<string, unknown> }): Promise<TRecord>
  count(args?: { where?: Record<string, unknown> }): Promise<number>
  name?: string
}

/**
 * Infiere el modelo de datos propio de Prisma (TRecord) a partir del Delegate proporcionado
 */
export type PrismaModelRecord<TModel> =
  TModel extends { findFirst(...args: any[]): Promise<infer R | null> } // eslint-disable-line @typescript-eslint/no-explicit-any -- Exception 001: see docs/explanation/typescript-eslint-exceptions.md
    ? NonNullable<R>
    : TModel extends { findMany(...args: any[]): Promise<Array<infer R>> } // eslint-disable-line @typescript-eslint/no-explicit-any -- Exception 001: see docs/explanation/typescript-eslint-exceptions.md
    ? R
    : Record<string, unknown>

export class BaseRepository<
  TDTO,
  TCreate extends Record<string, any> = any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Exception 001: see docs/explanation/typescript-eslint-exceptions.md
  TUpdate = Partial<TCreate>,
  TModel extends IPrismaDelegate<any> = any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Exception 001: see docs/explanation/typescript-eslint-exceptions.md
  TRecord extends Record<string, any> = PrismaModelRecord<TModel> // eslint-disable-line @typescript-eslint/no-explicit-any -- Exception 001: see docs/explanation/typescript-eslint-exceptions.md
> implements IBaseRepository<TDTO, TCreate, TUpdate> {
  constructor(
    private readonly Model: TModel,
    private readonly parserFn: (model: TRecord) => TDTO,
    private readonly modelName: string = Model.name ?? 'Model',
    private readonly whereField: (keyof TRecord | keyof TDTO) & string,
    private readonly idField: keyof TRecord & string = ('id' as unknown) as keyof TRecord & string
  ) {}

  async getAll(
    field?: unknown,
    whereField?: keyof TDTO | string
  ): Promise<TDTO[]> {
    const key = (whereField ?? this.whereField) as string
    const whereClause = field != null ? { [key]: field } : {}
    const models: TRecord[] = await this.Model.findMany({ where: whereClause })
    return models.map(this.parserFn)
  }

  async getWithPages(
    options?: IPaginatedOptions<TDTO>
  ): Promise<IPaginatedResults<TDTO>> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const whereClause = (options?.query ?? {}) as Record<string, unknown>
    const skip = (page - 1) * limit

    const orderClause = options?.order
      ? Object.entries(options.order).map(([field, dir]) => ({
        [field]: (String(dir).toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
      }))
      : [{ [this.whereField]: 'asc' as const }]

    const data: TRecord[] = await this.Model.findMany({
      where: whereClause,
      orderBy: orderClause,
      skip,
      take: limit
    })
    const total = await this.Model.count({ where: whereClause })

    return {
      info: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: data.map(this.parserFn)
    }
  }

  async getById(id: string | number): Promise<TDTO> {
    const model: TRecord | null = await this.Model.findUnique({
      where: { [this.idField]: id }
    })
    if (!model) throwError(ERROR_CODE.NOT_FOUND, \`\${this.modelName} not found\`)
    return this.parserFn(model)
  }

  async findByField(
    field: unknown,
    whereField: keyof TDTO | string = this.whereField
  ): Promise<TDTO | null> {
    if (field == null) {
      throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, \`No value provided for \${String(whereField)}\`)
    }
    const model: TRecord | null = await this.Model.findFirst({
      where: { [whereField as string]: field }
    })
    return model ? this.parserFn(model) : null
  }

  async create(data: TCreate): Promise<TDTO> {
    const model: TRecord = await this.Model.create({ data })
    return this.parserFn(model)
  }

  async update(
    id: string | number,
    data: TUpdate
  ): Promise<TDTO> {
    const model = await this.Model.findUnique({ where: { [this.idField]: id } })
    if (!model) throwError(ERROR_CODE.NOT_FOUND, \`\${this.modelName} not found\`)
    const updated: TRecord = await this.Model.update({
      where: { [this.idField]: id },
      data
    })
    return this.parserFn(updated)
  }

  async delete(id: string | number): Promise<string> {
    const model: TRecord | null = await this.Model.findUnique({ where: { [this.idField]: id } })
    if (!model) throwError(ERROR_CODE.NOT_FOUND, \`\${this.modelName} not found\`)
    const value = (model as Record<string, unknown>)[this.whereField]
    await this.Model.delete({ where: { [this.idField]: id } })
    return \`\${String(value)} deleted successfully\`
  }
}`
export const baseRepositoryTest = `import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { startUp, closeDatabase, prisma } from '../../configs/database.ts'
import { BaseRepository } from './BaseRepository.ts'
import * as help from './testHelpers/testHelp.help.ts'


describe('BaseRepository unit test', () => {
  beforeAll(async() => {
    await startUp(true)
  })
  afterAll(async() => {
    await closeDatabase()
  })
  const UserModel = prisma.user
  const test = new BaseRepository(UserModel, help.parser, 'User', 'email')
  describe('Create method', () => {
    it('should create a element', async() => {
      const response = await test.create(help.dataCreate)
      expect(response).toEqual({
        id: expect.any(String),
        email: 'user@email.com',
        password: '123456',
        nickname: 'userTest',
        name: 'user',
        picture: 'https://picsum.photos/200?random=16',
        enabled: true
      })
      help.setStringId(response.id)
    })
  })
  describe('Get methods', () => {
    describe('"getAll" method', () => {
      it('should retrieve an array of elements', async() => {
        await help.createSeedRandomElements(UserModel, help.usersSeed)
        const response = await test.getAll()
        expect(response.length).toBe(16)
      })
      it('Should retrieve an array of elements filtered by query', async() => {
        const response = await test.getAll(false, 'enabled')
        expect(response.length).toBe(3)
      })
    })
    describe('"getById" method', () => {
      it('Should retrieve an element by Id', async() => {
        const response = await test.getById(help.getStringId())
        expect(response).toEqual({
          id: expect.any(String),
          email: 'user@email.com',
          password: '123456',
          nickname: 'userTest',
          name: 'user',
          picture: 'https://picsum.photos/200?random=16',
          enabled: true
        })
      })
    })
    describe('"findByField" method', () => {
      it('Should retrieve an element by field', async() => {
        const response = await test.findByField('user15@email.com', 'email')
        expect(response).toEqual({
          id: expect.any(String),
          email: 'user15@email.com',
          password: '123456',
          nickname: 'userTest15',
          name: 'Fifteen',
          picture: 'https://picsum.photos/200?random=15',
          enabled: expect.any(Boolean)
        })
      })
    })
    describe('"getWithPages" method', () => {
      it('Should retrieve an array of paginated elements', async() => {
        const queryObject = { page: 1, limit: 10 }as const
        const response = await test.getWithPages(queryObject)
        expect(response.info).toEqual({ total: 16, page: 1, limit: 10, totalPages: 2 })
        expect(response.data.length).toBe(10)
        expect(response.data.map(a => a.name)).toEqual(['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'])// Order
      })
      it('Should retrieve filtered and sorted elements', async() => {
        const queryObject = { page: 1, limit: 10, query: { enabled: false }, order: { name: 'ASC' } } as const
        const response = await test.getWithPages(queryObject)
        expect(response.info).toEqual({ total: 3, page: 1, limit: 10, totalPages: 1 })
        expect(response.data.length).toBe(3)
        expect(response.data.map(a => a.name)).toEqual(['Fifteen', 'Seven', 'Six'])// Order
      })
    })
  })
  describe('Update method', () => {
    it('should update an element', async() => {
      const data = { name: 'Name of user' }
      const response = await test.update(help.getStringId(), data)
      expect(response).toEqual({
        id: expect.any(String),
        ...help.dataUpdate
      })
    })
  })
  describe('Delete method', () => {
    it('should deleted an element', async() => {
      const response = await test.delete(help.getStringId())
      expect(response).toBe('user@email.com deleted successfully')
    })
  })
})`

export const baseRepositoryTestHelp = `import type { UserModel } from '../../../generated/prisma/models/User.js'
import { UuidHandler } from '../../utils/UuidHandler.js'

export interface IUserTest {
  id: string
  email: string
  password: string
  nickname?: string | null
  name: string
  picture?: string | null
  enabled: boolean
}
export interface CreateUserInput {
  id: string
  email: string
  password: string
  nickname?: string | null
  name?: string | null
  picture?: string | null
  enabled: boolean
}
export type UpdateUserInput = Partial<CreateUserInput>

export const parser = (raw: UserModel): IUserTest => {
  return {
    id: raw.id,
    email: raw.email,
    password: raw.password,
    nickname: raw.nickname,
    name: raw.name ?? '',
    picture: raw.picture,
    enabled: raw.enabled
  }
}
export const dataCreate = {
  id: UuidHandler.createUuid(),
  email: 'user@email.com',
  password: '123456',
  nickname: 'userTest',
  name: 'user',
  picture: 'https://picsum.photos/200?random=16'
}
export const dataUpdate: UpdateUserInput = {
  email: 'user@email.com',
  password: '123456',
  nickname: 'userTest',
  name: 'Name of user',
  picture: 'https://picsum.photos/200?random=16',
  enabled: true
}
let stringId:string = ''
export const setStringId = (id:string):void => {
  stringId = id
}
export const getStringId = ():string => {
  return stringId
}
//* --------------------------------------------------
// ?          UserSeed
//* ------------------------------------------------
export const createSeedRandomElements = async(
  model: { createMany: (args: { data: any }) => Promise<unknown> },//eslint-disable-line
  seed: unknown[]
) => {
  try {
    if (!seed || seed.length === 0) throw new Error('No data')
    await model.createMany({ data: seed })
  } catch (error) {
    console.error('Error createSeedRandomElements: ', error)
  }
}

export const usersSeed = [
  {
    id: UuidHandler.createUuid(),
    email: 'user01@email.com',
    password: '123456',
    nickname: 'userTest01',
    name: 'One',
    picture: 'https://picsum.photos/200?random=1',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user02@email.com',
    password: '123456',
    nickname: 'userTest02',
    name: 'Two',
    picture: 'https://picsum.photos/200?random=2',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user03@email.com',
    password: '123456',
    nickname: 'userTest03',
    name: 'Three',
    picture: 'https://picsum.photos/200?random=3',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user04@email.com',
    password: '123456',
    nickname: 'userTest04',
    name: 'Four',
    picture: 'https://picsum.photos/200?random=4',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user05@email.com',
    password: '123456',
    nickname: 'userTest05',
    name: 'Five',
    picture: 'https://picsum.photos/200?random=5',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user06@email.com',
    password: '123456',
    nickname: 'userTest06',
    name: 'Six',
    picture: 'https://picsum.photos/200?random=6',
    enabled: false
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user07@email.com',
    password: '123456',
    nickname: 'userTest07',
    name: 'Seven',
    picture: 'https://picsum.photos/200?random=7',
    enabled: false
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user08@email.com',
    password: '123456',
    nickname: 'userTest08',
    name: 'Eight',
    picture: 'https://picsum.photos/200?random=8',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user09@email.com',
    password: '123456',
    nickname: 'userTest09',
    name: 'Nine',
    picture: 'https://picsum.photos/200?random=9',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user10@email.com',
    password: '123456',
    nickname: 'userTest10',
    name: 'Ten',
    picture: 'https://picsum.photos/200?random=10',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user11@email.com',
    password: '123456',
    nickname: 'userTest11',
    name: 'Eleven',
    picture: 'https://picsum.photos/200?random=11',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user12@email.com',
    password: '123456',
    nickname: 'userTest12',
    name: 'Twelve',
    picture: 'https://picsum.photos/200?random=12',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user13@email.com',
    password: '123456',
    nickname: 'userTest13',
    name: 'Thirteen',
    picture: 'https://picsum.photos/200?random=13',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user14@email.com',
    password: '123456',
    nickname: 'userTest14',
    name: 'Fourteen',
    picture: 'https://picsum.photos/200?random=14',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user15@email.com',
    password: '123456',
    nickname: 'userTest15',
    name: 'Fifteen',
    picture: 'https://picsum.photos/200?random=15',
    enabled: false
  }
]`