const { Pool } = require('pg');

// create pool using DATABASE_URL env var; many hosts require SSL in prod
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ensure users table exists on startup
async function init() {
  const create = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(create);
    console.log('✅ users table ensured');
  } catch (err) {
    console.error('❌ error creating users table', err);
  }
}

init().catch(err => console.error('db init failure', err));

module.exports = pool;
