// better-sqlite3 needs no separate database process and builds cleanly on
// current Node, which is why it replaced the old sqlite3 driver.
const base = {
  client: 'better-sqlite3',
  useNullAsDefault: true,
  migrations: { directory: './src/database/migrations' },
}

module.exports = {
  development: { ...base, connection: { filename: './src/database/db.sqlite' } },
  test: { ...base, connection: { filename: './src/database/test.sqlite' } },
}
