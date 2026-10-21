
export const prismaAuthTestFastify =`import * as db from '../../configs/database.js'

describe('Auth Integration Tests',() => {

  beforeAll(async() => {
    await db.startUp(true)
    await testUsersSeed()
    server = await createAuthTestServer()
  })

  afterAll(async() => {
    if (server) await server.close()
    await db.closeDatabase()
  })`

export const prismaAuthTestExpress =`
import * as db from '../../configs/database.js'

describe('Auth Integration Tests',() => {

  beforeAll(async() => {
    await db.startUp(true)
    await testUsersSeed()
  })

  afterAll(async() => {
    await db.closeDatabase()
  })`