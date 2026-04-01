// Database migration script
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('📊 Starting database migration...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Migration completed successfully!');
    console.log('Database tables created:');
    console.log('  - users');
    console.log('  - saved_verses');
    console.log('  - songs');
    console.log('  - user_progress');
    console.log('  - user_streaks');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
