# TypeScript and ESLint Exceptions

This document records deliberate exceptions to TypeScript and ESLint rules in the generated code. Each exception has a stable reference ID so code comments can point to its rationale and scope. Apply an exception only when the stated conditions match, and review it when those conditions change.

---

## 001 — Use of `any` in Prisma BaseRepository Generics

- **Rule:** `@typescript-eslint/no-explicit-any`
- **Scope:** `BaseRepository.ts` in Prisma persistence layers (both in generator template `src/templates/persistence/prisma/files/baseRepository.ts` and generated projects like `aaa/src/shared/repositories/BaseRepository.ts`).
  - `PrismaModelRecord<TModel>` inference helper (`findFirst(...args: any[])`, `findMany(...args: any[])`).
  - `BaseRepository` generic parameters defaults (`TCreate extends Record<string, any> = any`, `TModel extends IPrismaDelegate<any> = any`, `TRecord extends Record<string, any>`).
- **Reasoning:**
  - **Lack of a common Prisma Delegate interface:** Prisma Client autogenerates discrete, independent delegates for each schema model (e.g. `UserDelegate`, `SessionDelegate`). These delegates do not implement a shared interface or extend a common generic base class.
  - **Function parameter contravariance:** Prisma delegates have methods with specific model arguments (e.g. `create(args: { data: UserCreateInput })`, `where: UserWhereInput`). In TypeScript (with strict function types enabled), function arguments are contravariant. Attempting to define a generic `IPrismaDelegate` using `unknown` (e.g., `data: unknown` or `where: Record<string, unknown>`) causes TypeScript to reject passing Prisma delegates (like `prisma.user`) to `BaseRepository` because `unknown` cannot satisfy model-specific inputs such as `UserCreateInput`.
  - **Preservation of consumer ergonomics:** Requiring callers to pass every single input type manually (e.g., `new BaseRepository<UserModel, UserProps, Partial<UserProps>, typeof userModel, UserCreateInput, UserWhereInput>(...)`) creates severe friction and boilerplate in every domain repository.
  - **Zero leak into domain and public API:** The use of `any` is strictly contained to the delegate abstraction adapter and fallback defaults. All public repository methods (`getAll`, `getById`, `findByField`, `create`, `update`, `delete`, `getWithPages`) expose clean, strongly typed signatures through `TDTO`, `TCreate`, and `TUpdate` without exposing `any` to the consumer application.
- **Criteria:**
  - Permitted only within `BaseRepository.ts` for Prisma delegate signatures and generic type parameter defaults.
  - Must NOT be used in application features, domain entities, controllers, services, validation schemas, or route handlers.
- **Review when:**
  - Prisma introduces standard first-class generic Delegate contracts or exported abstract delegate definitions across models.
  - TypeScript introduces existential types or enhanced variance annotations that allow abstract delegate binding without contravariance friction.