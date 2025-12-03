import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// Test the database connection
db.getConnection()
  .then((connection) => {
    console.log("Connected to database successfully!✅");
    connection.release();
  })
  .catch((err) => {
    console.error(`Connection failed!: ${err.stack}`);
  });

export default db;
