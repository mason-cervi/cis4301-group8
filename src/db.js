const oracledb = require('oracledb');

let pool;

export async function initialize() {
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 4,
      poolMax: 4,
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
