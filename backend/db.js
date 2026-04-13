const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const dbDir = path.join(__dirname, 'db')
const usersPath = path.join(dbDir, 'users.json')
const consultationsPath = path.join(dbDir, 'consultations.json')
const doctorRequestsPath = path.join(dbDir, 'doctor_requests.json')

const usePostgres = Boolean(process.env.DATABASE_URL)
let pool = null

function ensureDir() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
}

function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8')
  }
}

function readJson(filePath, defaultData) {
  ensureDir()
  ensureFile(filePath, defaultData)
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading JSON file', filePath, err)
    return defaultData
  }
}

function writeJson(filePath, data) {
  ensureDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function getNextId(items) {
  const max = items.reduce((acc, item) => Math.max(acc, item.id || 0), 0)
  return max + 1
}

function normalizeDates(row, keys = []) {
  const normalized = { ...row }
  keys.forEach((key) => {
    if (normalized[key] instanceof Date) {
      normalized[key] = normalized[key].toISOString()
    } else if (typeof normalized[key] === 'string' && !isNaN(Date.parse(normalized[key]))) {
      normalized[key] = new Date(normalized[key]).toISOString()
    }
  })
  return normalized
}

async function initPostgres() {
  if (!usePostgres) return

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.PG_MAX_CLIENTS || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })

  pool.on('error', (err) => {
    console.error('Postgres pool error', err)
  })

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id integer PRIMARY KEY,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    is_verified boolean DEFAULT false,
    email_verification_token text,
    email_verification_expires timestamptz,
    password_reset_token text,
    password_reset_expires timestamptz,
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  )`)

  await pool.query(`CREATE TABLE IF NOT EXISTS consultations (
    id integer PRIMARY KEY,
    user_id integer,
    username text,
    message text,
    reply text,
    created_at timestamptz DEFAULT now()
  )`)

  await pool.query(`CREATE TABLE IF NOT EXISTS doctor_requests (
    id integer PRIMARY KEY,
    user_id integer,
    full_name text,
    email text,
    phone text,
    symptoms text,
    preferred_date text,
    preferred_time text,
    urgency text,
    specialty text,
    created_at timestamptz DEFAULT now()
  )`)

  console.log('✅ Postgres connected and tables ensured')
}

async function getUsers() {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id ASC')
    return rows.map((row) => normalizeDates(row, ['email_verification_expires', 'password_reset_expires', 'created_at']))
  }
  return readJson(usersPath, { users: [] }).users || []
}

async function saveUsers(users) {
  if (pool) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM users')
      for (const user of users) {
        await client.query(
          `INSERT INTO users (
            id,
            username,
            email,
            password_hash,
            is_verified,
            email_verification_token,
            email_verification_expires,
            password_reset_token,
            password_reset_expires,
            is_admin,
            created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            user.id,
            user.username,
            user.email,
            user.password_hash,
            Boolean(user.is_verified),
            user.email_verification_token || null,
            user.email_verification_expires || null,
            user.password_reset_token || null,
            user.password_reset_expires || null,
            Boolean(user.is_admin),
            user.created_at || new Date().toISOString()
          ]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
    return
  }
  writeJson(usersPath, { users })
}

async function getConsultations() {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM consultations ORDER BY id ASC')
    return rows.map((row) => normalizeDates(row, ['created_at']))
  }
  return readJson(consultationsPath, { consultations: [] }).consultations || []
}

async function saveConsultations(consultations) {
  if (pool) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM consultations')
      for (const consultation of consultations) {
        await client.query(
          `INSERT INTO consultations (
            id,
            user_id,
            username,
            message,
            reply,
            created_at
          ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            consultation.id,
            consultation.user_id || null,
            consultation.username || null,
            consultation.message || null,
            consultation.reply || null,
            consultation.created_at || new Date().toISOString()
          ]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
    return
  }
  writeJson(consultationsPath, { consultations })
}

async function getDoctorRequests() {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM doctor_requests ORDER BY id ASC')
    return rows.map((row) => normalizeDates(row, ['created_at']))
  }
  return readJson(doctorRequestsPath, { requests: [] }).requests || []
}

async function saveDoctorRequests(requests) {
  if (pool) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM doctor_requests')
      for (const request of requests) {
        await client.query(
          `INSERT INTO doctor_requests (
            id,
            user_id,
            full_name,
            email,
            phone,
            symptoms,
            preferred_date,
            preferred_time,
            urgency,
            specialty,
            created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            request.id,
            request.user_id || null,
            request.full_name || null,
            request.email || null,
            request.phone || null,
            request.symptoms || null,
            request.preferred_date || null,
            request.preferred_time || null,
            request.urgency || null,
            request.specialty || null,
            request.created_at || new Date().toISOString()
          ]
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
    return
  }
  writeJson(doctorRequestsPath, { requests })
}

initPostgres().catch((err) => {
  console.error('Failed to initialize Postgres:', err)
  pool = null
})

module.exports = {
  pool,
  getUsers,
  saveUsers,
  getConsultations,
  saveConsultations,
  getDoctorRequests,
  saveDoctorRequests,
  getNextId
}
