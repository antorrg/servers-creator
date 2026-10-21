import type  { ProjectConfig } from '../../../types.js'


export const testOrms = (options:ProjectConfig)=>{ 

 const objectTest = {   
  dbImportPrisma:'',
  prisma:`
  describe('Database existence', () => {
    it('should query tables and return an empty array', async() => {
      const results = await Promise.all([
        db.prisma.user.findMany(),
        db.prisma.log.findMany()${options.selectedAuth.endsWith('session')?',\n        db.prisma.session.findMany()': ''}
      ])
      results.forEach((result: unknown[]) => {
        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(0)
      })
    })
  })`,
  dbImportSequelize:'',
  sequelize: `
  describe('Database existence', () => {
    it('should query tables and return an empty array', async() => { 
      const models = await Promise.all([ 
        db.Log.findAll(),
        db.User.findAll(),
        ${options.selectedAuth.endsWith('session')?'db.Session.findAll()': ''}
      ])
      models.forEach((model) => {
        expect(Array.isArray(model)).toBe(true)
        expect(model).toHaveLength(0)
      })
    })
  })
    `,
  dbImportDrizzle:"import * as sch from '../schemas/index.schemas.js'",
  drizzle: `
  describe('Database existence', () => {
    it('should query tables and return an empty array', async() => {
      const results = await Promise.all([
        db.db.select().from(sch.user).limit(0),
        db.db.select().from(sch.log).limit(0)${options.selectedAuth.endsWith('session')?',\n        db.db.select().from(sch.session).limit(0)': ''}
      ])
      results.forEach((result: unknown[]) => {
        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(0)
      })
    })
  })
    `}
      switch(options.selectedOrm){
    case 'sequelize':
     return {
      importTest: objectTest.dbImportSequelize,
      startUp: 'await db.startUp(true, true)',
      testCode: objectTest.sequelize
     }
    case 'prisma':
      return {
        importTest: objectTest.dbImportPrisma,
        startUp: 'await db.startUp(true)',
        testCode: objectTest.prisma
     }
    case 'drizzle': 
      return {
        importTest: objectTest.dbImportDrizzle,
        startUp: 'await db.startUp()',
        testCode: objectTest.drizzle
     }
    case 'none': 
      return {
        importTest: '',
        startUp: '',
        testCode: ''
     }
    default: throw new Error(`[Orm-Section]: Orm ${options.selectedOrm} not implemented yet`)
  }
}