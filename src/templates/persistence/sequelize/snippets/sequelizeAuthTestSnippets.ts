
export const sequelizeAuthTestExpress =`
import * as db from '../../configs/database.js'

describe('Auth Integration Tests', () => {
  
  beforeAll(async() => {
    await db.startUp(true, true)
    await testUsersSeed()
  })
  afterAll(async() => {
    await db.closeDatabase()
  })`


export const sequelizeAuthTestFastify =`
import * as db from '../../configs/database.js'

describe('Auth Integration Tests', () => {

  beforeAll(async() => {
    await db.startUp(true, true)
    await testUsersSeed()
    server = await createAuthTestServer()
  })

  afterAll(async() => {
    if (server) await server.close()
    await db.closeDatabase()
  })`
