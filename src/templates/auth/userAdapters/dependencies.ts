export const dependencies = `import type { IExternalImageDeleteService } from './interfaces/base.interface.js'
import { UserRepository } from '../features/user/UserRepository.js'
import { UserService } from '../features/user/UserService.js'
import sessionAdapter from './auth/session/connect-db.js'


export const mockImageDeleteService: IExternalImageDeleteService<string> = {
  deleteImage: async(_imageInfo: string) => await Promise.resolve('true')
}

export const userRepository = new UserRepository()
export const userService = new UserService(
  userRepository,
  mockImageDeleteService.deleteImage,
  (userId: string) => sessionAdapter.destroyByUserId(userId)
)`