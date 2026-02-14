// database/index.js
/*const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** 
let pool;

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Added for troubleshooting queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text });
        throw error;
      }
    },
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  module.exports = pool;
}  */ 
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://db_340_db_x8w1_user:t27ktNtUXobTBweidE9bAQwOOF78TNTV@dpg-d5tjvbcr85hc73fa03k0-a/db_340_db_x8w1",
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
  process.exit(1);
});

module.exports = pool;
