// Create session table in core database for authentication session storage
const { corePool } = require('../config/database-core-cjs');

async function createSessionTableInCore() {
  const client = await corePool.connect();
  
  try {
    console.log('🔧 Creating session table in core database...');
    
    // Drop existing session table if it exists
    await client.query('DROP TABLE IF EXISTS session');
    console.log('✅ Dropped existing session table');
    
    // Create session table with proper structure for connect-pg-simple
    await client.query(`
      CREATE TABLE session (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    console.log('✅ Created session table');
    
    // Add primary key and index
    await client.query('ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;');
    await client.query('CREATE INDEX IDX_session_expire ON session(expire);');
    console.log('✅ Added primary key and index');
    
    // Verify table creation
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'session' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Session table created successfully with columns:');
    tableCheck.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating session table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
createSessionTableInCore()
  .then(() => {
    console.log('🎉 Session table creation completed successfully');
    corePool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Session table creation failed:', error);
    corePool.end();
    process.exit(1);
  });