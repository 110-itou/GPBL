const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  let failed = false;

  try {
    console.log('Starting database migration...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin','vendor')),
        vendor_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // Vendors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        vendor_name VARCHAR(255) NOT NULL,
        color_code VARCHAR(20) NOT NULL,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // Item Master table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS item_master (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // Deliveries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id SERIAL PRIMARY KEY,
        system_id VARCHAR(20) UNIQUE,
        item_id INTEGER NOT NULL,
        vendor_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        order_no VARCHAR(100) NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('納入予定','納入済','移動済','使用済')),
        current_location VARCHAR(1) NOT NULL CHECK (current_location IN ('A','B','C','D','E','F','G','H','I','J','K')),
        quantity DECIMAL(10,2) NOT NULL,
        scheduled_date DATE NULL,
        received_date DATE NULL,
        memo TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // Movement Logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movement_logs (
        id SERIAL PRIMARY KEY,
        delivery_id INTEGER NOT NULL,
        before_location VARCHAR(1),
        after_location VARCHAR(1) NOT NULL,
        moved_by INTEGER NOT NULL,
        moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        memo TEXT NULL
      )
    `);

    // Attachments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id SERIAL PRIMARY KEY,
        delivery_id INTEGER NOT NULL,
        file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo','pdf')),
        file_url TEXT NOT NULL,
        file_name VARCHAR(255),
        uploaded_by INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_deliveries_location ON deliveries(current_location)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_deliveries_vendor ON deliveries(vendor_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(scheduled_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movement_logs_delivery ON movement_logs(delivery_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_attachments_delivery ON attachments(delivery_id)');

    console.log('Database migration completed successfully!');
  } catch (error) {
    failed = true;
    console.error('Migration error:', error);
  } finally {
    await pool.end();
    if (failed) {
      process.exitCode = 1;
    }
  }
};

createTables();
