import './load-env.mjs'
import fs from 'node:fs/promises'
import pg from 'pg'

const { Client } = pg

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Put it in .env.')

  const sql = await fs.readFile(new URL('../db/0001_stage1.sql', import.meta.url), 'utf8')
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    await client.query(sql)
    console.log('Stage 1 database migration uğurla tamamlandı.')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Database migration xətası:', error instanceof Error ? error.message : error)
  process.exit(1)
})
