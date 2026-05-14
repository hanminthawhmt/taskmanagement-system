const { DATABASE_URL } = require("../config/env");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("DB connection failed: ", err.message);
    process.exit(1);
  }
  console.log("PostgreSQL connected");
  release();
});

module.exports = pool;
