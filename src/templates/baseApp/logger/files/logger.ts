
export const logger = `import pino, { type Logger as PinoLogger } from 'pino'
import envConfig from './envConfig.js'
import { fileTransport } from './logger/transports/fileTransport.js'
import { dbWritableStream } from './logger/transports/dbTransport.js'

let logger: PinoLogger

switch (envConfig.Status) {
case 'test':
  // Pretty print en carpeta aparte
  logger = pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        destination: \`logs/test/\${new Date().toISOString()}.info.log\`,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        mkdir:true
      }
    }
  })
  break

case 'development': // dev
  // Guardar logs en archivo
  logger = pino({
    level: 'info',
    transport: fileTransport()
  })
  break

case 'production':
  // Guardar logs en la base de datos usando Sequelize
  logger = pino(
    {
      level: 'info'
    },
    dbWritableStream() // stream personalizado
  )
  break

default:
  logger = pino()
}

export default logger
`