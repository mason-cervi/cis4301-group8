/*
const oracledb = require('oracledb');

let pool;

export async function initialize() {
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 30,
      poolIncrement: 1,
    });
    console.log('Database connection pool created');
  }
  return pool;
}

async function close() {
  await oracledb.getPool().close();
}

export async function execute(connection, query, params = {}) {
  try {
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}
*/

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_CONNECT_STRING, // Supabase connection string
  ssl: { rejectUnauthorized: false }
});

export async function initialize() {
  try {
    const client = await pool.connect();
    console.log('Database connection pool created');
    client.release(); // Release immediately after testing connection
  } catch (error) {
    console.error('Error initializing database pool:', error);
    throw error;
  }
}

export async function close() {
  await pool.end();
  console.log('Database pool closed');
}

export async function execute(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows; // Returns query results
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  } finally {
    client.release();
  }
}
