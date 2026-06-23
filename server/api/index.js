require('dotenv').config();

const { validateEnv } = require('../config/env');
const connectDB = require('../config/db');
const app = require('../app');

let dbConnectionPromise;

async function ensureDatabase() {
  if (!dbConnectionPromise) {
    validateEnv();
    dbConnectionPromise = connectDB();
  }

  return dbConnectionPromise;
}

module.exports = async function handler(req, res) {
  await ensureDatabase();
  return app(req, res);
};
