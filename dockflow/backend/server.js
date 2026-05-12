const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const multer = require('multer');
const { cloudinary, uploadFilesFallback } = require('./middleware/upload');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, vendor_id FROM users WHERE deleted_at IS NULL ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deliveries
app.get('/api/deliveries', async (req, res) => {
  try {
    const { item_id, vendor_id, current_location, status, date } = req.query;
    let query = `
      SELECT d.*, i.item_name, v.vendor_name, v.color_code, u.name as created_by_name
      FROM deliveries d
      LEFT JOIN item_master i ON d.item_id = i.id
      LEFT JOIN vendors v ON d.vendor_id = v.id
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.deleted_at IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    if (item_id) {
      query += ` AND d.item_id = $${paramIndex++}`;
      params.push(item_id);
    }
    if (vendor_id) {
      query += ` AND d.vendor_id = $${paramIndex++}`;
      params.push(vendor_id);
    }
    if (current_location) {
      query += ` AND d.current_location = $${paramIndex++}`;
      params.push(current_location);
    }
    if (status) {
      query += ` AND d.status = $${paramIndex++}`;
      params.push(status);
    }
    if (date) {
      query += ` AND (d.scheduled_date = $${paramIndex} OR d.received_date = $${paramIndex})`;
      params.push(date);
    }

    query += ' ORDER BY d.status, d.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/deliveries', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      item_id,
      vendor_id,
      created_by,
      order_no,
      status,
      current_location,
      quantity,
      scheduled_date,
      received_date,
      memo
    } = req.body;

    // Generate system_id
    const lastDelivery = await client.query(
      'SELECT system_id FROM deliveries ORDER BY id DESC LIMIT 1'
    );
    let nextNumber = 1;
    if (lastDelivery.rows.length > 0) {
      const lastId = lastDelivery.rows[0].system_id;
      const match = lastId.match(/DLV-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    const system_id = `DLV-${nextNumber.toString().padStart(4, '0')}`;

    const result = await client.query(
      `INSERT INTO deliveries 
       (system_id, item_id, vendor_id, created_by, order_no, status, current_location, quantity, scheduled_date, received_date, memo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [system_id, item_id, vendor_id, created_by, order_no, status, current_location, quantity, scheduled_date, received_date, memo]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.put('/api/deliveries/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      status,
      quantity,
      order_no,
      scheduled_date,
      received_date,
      memo,
      current_location
    } = req.body;

    // Get current delivery for movement log
    const currentDelivery = await client.query(
      'SELECT * FROM deliveries WHERE id = $1',
      [id]
    );

    if (currentDelivery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const oldLocation = currentDelivery.rows[0].current_location;
    const newLocation = current_location || oldLocation;

    // Update delivery
    const result = await client.query(
      `UPDATE deliveries 
       SET status = $1, quantity = $2, order_no = $3, scheduled_date = $4, received_date = $5, memo = $6, current_location = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [status, quantity, order_no, scheduled_date, received_date, memo, newLocation, id]
    );

    // Create movement log if location changed
    if (oldLocation !== newLocation) {
      await client.query(
        `INSERT INTO movement_logs (delivery_id, before_location, after_location, moved_by)
         VALUES ($1, $2, $3, $4)`,
        [id, oldLocation, newLocation, req.body.moved_by || currentDelivery.rows[0].created_by]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating delivery:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE deliveries SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CSV Export
app.get('/api/deliveries/export/csv', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.system_id,
        i.item_name,
        v.vendor_name,
        d.order_no,
        d.status,
        d.current_location,
        d.quantity,
        d.scheduled_date,
        d.received_date,
        d.memo,
        d.created_at
      FROM deliveries d
      LEFT JOIN item_master i ON d.item_id = i.id
      LEFT JOIN vendors v ON d.vendor_id = v.id
      WHERE d.deleted_at IS NULL
      ORDER BY d.created_at DESC
    `);

    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: 'deliveries.csv',
      header: [
        { id: 'system_id', title: 'システムID' },
        { id: 'item_name', title: '品名' },
        { id: 'vendor_name', title: '業者' },
        { id: 'order_no', title: '発注番号' },
        { id: 'status', title: '状態' },
        { id: 'current_location', title: '場所' },
        { id: 'quantity', title: '個数' },
        { id: 'scheduled_date', title: '納入予定日' },
        { id: 'received_date', title: '受取日' },
        { id: 'memo', title: 'メモ' },
        { id: 'created_at', title: '作成日時' }
      ]
    });

    await csvWriter.writeRecords(result.rows);
    res.download('deliveries.csv');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Masters - Vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vendors WHERE deleted_at IS NULL ORDER BY vendor_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { vendor_name, color_code, created_by } = req.body;
    const result = await pool.query(
      'INSERT INTO vendors (vendor_name, color_code, created_by) VALUES ($1, $2, $3) RETURNING *',
      [vendor_name, color_code, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_name, color_code } = req.body;
    const result = await pool.query(
      'UPDATE vendors SET vendor_name = $1, color_code = $2 WHERE id = $3 RETURNING *',
      [vendor_name, color_code, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE vendors SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Masters - Items
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM item_master WHERE deleted_at IS NULL ORDER BY item_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { item_name } = req.body;
    const result = await pool.query(
      'INSERT INTO item_master (item_name) VALUES ($1) RETURNING *',
      [item_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name } = req.body;
    const result = await pool.query(
      'UPDATE item_master SET item_name = $1 WHERE id = $2 RETURNING *',
      [item_name, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE item_master SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calendar
app.get('/api/calendar', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id,
        d.system_id,
        d.scheduled_date,
        d.status,
        d.current_location,
        i.item_name,
        v.vendor_name,
        v.color_code
      FROM deliveries d
      LEFT JOIN item_master i ON d.item_id = i.id
      LEFT JOIN vendors v ON d.vendor_id = v.id
      WHERE d.deleted_at IS NULL AND d.scheduled_date IS NOT NULL
      ORDER BY d.scheduled_date
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const scheduledToday = await pool.query(
      'SELECT COUNT(*) as count FROM deliveries WHERE scheduled_date = $1 AND deleted_at IS NULL',
      [today]
    );
    
    const notReceived = await pool.query(
      'SELECT COUNT(*) as count FROM deliveries WHERE scheduled_date < $1 AND status NOT IN ($2, $3) AND deleted_at IS NULL',
      [today, '使用済', '納入済']
    );
    
    const updatedToday = await pool.query(
      'SELECT COUNT(*) as count FROM deliveries WHERE updated_at::date = $1 AND deleted_at IS NULL',
      [today]
    );
    
    res.json({
      scheduled_today: parseInt(scheduledToday.rows[0].count),
      not_received: parseInt(notReceived.rows[0].count),
      updated_today: parseInt(updatedToday.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Movement Logs
app.get('/api/deliveries/:id/movements', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT ml.*, u.name as moved_by_name
      FROM movement_logs ml
      LEFT JOIN users u ON ml.moved_by = u.id
      WHERE ml.delivery_id = $1
      ORDER BY ml.moved_at DESC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movement logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attachments
app.get('/api/deliveries/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM attachments WHERE delivery_id = $1 AND deleted_at IS NULL ORDER BY uploaded_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File Upload
app.post('/api/deliveries/:id/attachments', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { files, uploaded_by } = req.body;
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(400).json({ 
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
      });
    }

    await client.query('BEGIN');

    for (const file of files) {
      await client.query(
        `INSERT INTO attachments (delivery_id, file_type, file_url, file_name, uploaded_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, file.file_type, file.file_url, file.file_name, uploaded_by]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Files uploaded successfully', count: files.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Delete Attachment
app.delete('/api/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get attachment info for Cloudinary deletion
    const attachment = await pool.query(
      'SELECT * FROM attachments WHERE id = $1',
      [id]
    );
    
    if (attachment.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete from Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && attachment.rows[0].file_url) {
      try {
        const publicId = attachment.rows[0].file_url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Soft delete from database
    await pool.query(
      'UPDATE attachments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
