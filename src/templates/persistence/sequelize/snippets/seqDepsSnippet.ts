export const seqDepSnippet = {
  deps: `"sequelize": "^6.37.8",
    "pg": "^8.17.2",
    "pg-hstore": "^2.3.4",`,
  devDeps: `"@types/pg": "^8.23.1",`
}
/**
 * // conditional use for auth with whitelist
 */
export const sequelizeTestFnSnippet = {
  arr: `db.Log,
        db.User,`,
  arrAuth:`db.Log,
        db.User,
        db.RefreshToken`,
  arrSession: `db.Log,
        db.User,
        db.Session`,
  code: `$const records = await model.findAll()`
}
