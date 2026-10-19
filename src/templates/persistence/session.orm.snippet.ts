import type { ProjectConfig } from "../../types.js"
import { sequelizeAuthTestExpress, sequelizeAuthTestFastify } from "./sequelize/snippets/sequelizeAuthTestSnippets.js"
import { prismaAuthTestExpress, prismaAuthTestFastify } from "./prisma/snippets/prismaAuthTestSnippets.js"
import { drizzleAuthTestExpress, drizzleAuthTestFastify } from "./drizzle/snippets/drizzleAuthTestSnippets.js"


export const sessionOrmSnippet = (options: ProjectConfig) => {
    switch(options.selectedServer){
        case 'express':
              switch(options.selectedOrm){
                case 'sequelize':
                    return sequelizeAuthTestExpress
                case 'prisma':
                    return prismaAuthTestExpress
                case 'drizzle': 
                    return drizzleAuthTestExpress
                default:
                    throw new Error(`[Auth.sessionOrmSnippet]: ${options.selectedOrm} cause`)
            }
        case 'fastify':
                switch(options.selectedOrm){
                  case 'sequelize':
                        return sequelizeAuthTestFastify
                  case 'prisma':
                        return prismaAuthTestFastify
                  case 'drizzle': 
                        return drizzleAuthTestFastify
                  default:
                        throw new Error(`[Auth.sessionOrmSnippet]: ${options.selectedOrm} cause`)
                }
        default:
            throw new Error(`[Auth.sessionOrmSnippet]: ${options.selectedServer} cause`)
        }
}