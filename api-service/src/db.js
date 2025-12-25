import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS import_jobs (
      id VARCHAR(40) PRIMARY KEY,
      source_url TEXT NOT NULL,
      source VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL,
      total_files INT DEFAULT 0,
      processed_files INT DEFAULT 0,
      failed_files INT DEFAULT 0,
      error TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      google_drive_id VARCHAR(255) NOT NULL UNIQUE,
      size_bytes BIGINT NULL,
      mime_type VARCHAR(150) NULL,
      storage_path TEXT NOT NULL,
      source VARCHAR(30) NOT NULL DEFAULT 'google_drive',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
