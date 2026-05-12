const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    await pool.query('DELETE FROM attachments');
    await pool.query('DELETE FROM movement_logs');
    await pool.query('DELETE FROM deliveries');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM vendors');
    await pool.query('DELETE FROM item_master');

    // Insert users
    const users = await pool.query(`
      INSERT INTO users (name, email, role, vendor_id) VALUES
      ('管理者', 'admin@dockflow.com', 'admin', NULL),
      ('A社', 'vendor-a@dockflow.com', 'vendor', NULL),
      ('B社', 'vendor-b@dockflow.com', 'vendor', NULL),
      ('C社', 'vendor-c@dockflow.com', 'vendor', NULL)
      RETURNING id
    `);

    // Insert vendors
    const vendors = await pool.query(`
      INSERT INTO vendors (vendor_name, color_code, created_by) VALUES
      ('A社', '#FF6B6B', $1),
      ('B社', '#4ECDC4', $1),
      ('C社', '#45B7D1', $1)
      RETURNING id
    `, [users.rows[0].id]);

    // Update vendor users with vendor_id
    await pool.query('UPDATE users SET vendor_id = $1 WHERE name = $2', [vendors.rows[0].id, 'A社']);
    await pool.query('UPDATE users SET vendor_id = $1 WHERE name = $2', [vendors.rows[1].id, 'B社']);
    await pool.query('UPDATE users SET vendor_id = $1 WHERE name = $2', [vendors.rows[2].id, 'C社']);

    // Insert items
    const items = await pool.query(`
      INSERT INTO item_master (item_name) VALUES
      ('バルブ'),
      ('配管'),
      ('モーター'),
      ('鋼材'),
      ('ポンプ'),
      ('電装品')
      RETURNING id
    `);

    // Insert sample deliveries
    const deliveries = await pool.query(`
      INSERT INTO deliveries (
        system_id, item_id, vendor_id, created_by, order_no, status, 
        current_location, quantity, scheduled_date, received_date, memo
      ) VALUES
      ('DLV-0001', $1, $2, $3, 'ORD-001', '納入予定', 'A', 10.0, CURRENT_DATE + INTERVAL '2 days', NULL, '緊急納品'),
      ('DLV-0002', $4, $5, $3, 'ORD-002', '納入済', 'B', 5.5, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', '検査済み'),
      ('DLV-0003', $6, $7, $3, 'ORD-003', '移動済', 'C', 20.0, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days', '倉庫へ移動済'),
      ('DLV-0004', $8, $9, $3, 'ORD-004', '使用済', 'D', 15.0, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', '現場設置完了'),
      ('DLV-0005', $10, $11, $3, 'ORD-005', '納入予定', 'E', 8.0, CURRENT_DATE + INTERVAL '1 day', NULL, '特注品'),
      ('DLV-0006', $12, $13, $3, 'ORD-006', '納入済', 'F', 12.0, CURRENT_DATE, CURRENT_DATE, '本日納入'),
      ('DLV-0007', $14, $15, $3, 'ORD-007', '移動済', 'G', 25.0, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', '仮置場から移動'),
      ('DLV-0008', $16, $17, $3, 'ORD-008', '納入予定', 'H', 3.0, CURRENT_DATE + INTERVAL '3 days', NULL, '予約済')
      RETURNING id
    `, [
      items.rows[0].id, vendors.rows[0].id, users.rows[0].id,  // DLV-0001
      items.rows[1].id, vendors.rows[1].id,                  // DLV-0002
      items.rows[2].id, vendors.rows[2].id,                  // DLV-0003
      items.rows[3].id, vendors.rows[0].id,                  // DLV-0004
      items.rows[4].id, vendors.rows[1].id,                  // DLV-0005
      items.rows[5].id, vendors.rows[2].id,                  // DLV-0006
      items.rows[0].id, vendors.rows[0].id,                  // DLV-0007
      items.rows[1].id, vendors.rows[1].id                   // DLV-0008
    ]);

    // Insert movement logs for some deliveries
    await pool.query(`
      INSERT INTO movement_logs (delivery_id, before_location, after_location, moved_by, memo) VALUES
      ($1, NULL, 'C', $2, '初期配置'),
      ($3, 'C', 'G', $2, '倉庫移動'),
      ($4, NULL, 'F', $2, '本日納入'),
      ($5, NULL, 'G', $2, '仮置場配置'),
      ($5, 'G', 'G', $2, '最終配置完了')
    `, [
      deliveries.rows[2].id, users.rows[0].id,  // DLV-0003
      deliveries.rows[6].id, users.rows[0].id,  // DLV-0007
      deliveries.rows[5].id, users.rows[0].id   // DLV-0006
    ]);

    console.log('Data seeding completed successfully!');
    console.log(`Created ${users.rows.length} users`);
    console.log(`Created ${vendors.rows.length} vendors`);
    console.log(`Created ${items.rows.length} items`);
    console.log(`Created ${deliveries.rows.length} deliveries`);
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await pool.end();
  }
};

seedData();
