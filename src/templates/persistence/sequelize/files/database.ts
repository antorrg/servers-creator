/**
 * database1 
 * database2
 */
export const database1 = `import envConfig from './envConfig.js'
import logger from './logger.js'
import { Sequelize } from 'sequelize'
import modelsDefinition from '../models/index.model.js'

const sequelize = new Sequelize(envConfig.DatabaseUrl, {
  logging:false,
  native:false
})


const [
  User,`
export const database2 =`] = Object.values(modelsDefinition).map(model => model(sequelize))

function getNameDb(dbUri:string):string {
  return dbUri.split('/').slice(-1).join()
}

async function startUp(syncDb: boolean = false, rewrite: boolean = false) {
  try {
    await sequelize.authenticate()
    const successMessage =\`Database postgreSQL "\${getNameDb(envConfig.DatabaseUrl)}" initialized successfully!!\`
    console.log(successMessage)
    if (envConfig.Status !== 'production' && syncDb) {
      try {
        await sequelize.sync({ force: rewrite })
        const message = \`Synced database \${getNameDb(envConfig.DatabaseUrl)}: "force \${rewrite}"\`
        logger.info(message)
      } catch (error) {
        logger.error(error)
        //console.error(\`❗Error syncing database \${getNameDb(envConfig.DatabaseUrl)}\`, error)
        throw error
      }
    }
    logger.info(successMessage)
  } catch (error) {
    //console.error('❌ Error conecting database!', error)
    logger.error(error)
    throw error
  }
}
const closeDatabase = async() => {
  await sequelize.close()
  logger.info('🛑 Database disconnect')
}


export {
  User,`