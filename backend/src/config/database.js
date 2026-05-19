const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'scripture_memory',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => console.log('✅ Database connected'));
}
pool.on('error', (err) => { console.error('❌ Database error:', err); });

const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res;
};

module.exports = { pool, query };
