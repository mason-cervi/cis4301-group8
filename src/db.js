const oracledb = require('oracledb');

async function initialize() {
    try{
        await oracledb.createPool({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          connectString: process.env.DB_CONNECT_STRING,
          poolMin: 4,
          poolMax: 4,
          poolIncrement: 0
        });
      }
      catch (error) {
        console.error('Connection failed: ', error);
      }
}

async function close() {
  await oracledb.getPool().close();
}

async function execute(sql, binds = [], opts = {}) {
  let conn;
  let result = [];
  try {
    conn = await oracledb.getConnection();
    result = await conn.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = { initialize, close, execute };