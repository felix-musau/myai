const fs = require('fs')
const path = require('path')

const dbDir = path.join(__dirname, 'db')
const usersPath = path.join(dbDir, 'users.json')
const consultationsPath = path.join(dbDir, 'consultations.json')
const doctorRequestsPath = path.join(dbDir, 'doctor_requests.json')

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

function getUsers() {
  return readJson(usersPath, { users: [] }).users || []
}

function saveUsers(users) {
  writeJson(usersPath, { users })
}

function getConsultations() {
  return readJson(consultationsPath, { consultations: [] }).consultations || []
}

function saveConsultations(consultations) {
  writeJson(consultationsPath, { consultations })
}

function getDoctorRequests() {
  return readJson(doctorRequestsPath, { requests: [] }).requests || []
}

function saveDoctorRequests(requests) {
  writeJson(doctorRequestsPath, { requests })
}

module.exports = {
  getUsers,
  saveUsers,
  getConsultations,
  saveConsultations,
  getDoctorRequests,
  saveDoctorRequests,
  getNextId
}
