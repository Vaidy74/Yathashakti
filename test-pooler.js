// Test connection using Supabase connection pooler
const { Client } = require('pg');

async function testConnection() {
  const connectionString = "postgresql://postgres:Qsapmol2025!@db.asgyemzdpfyblxdmtimj.supabase.co:6543/postgres";
  
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Attempting to connect to Supabase using connection pooler...');
    await client.connect();
    console.log('Connection successful!');
    
    // Query to test the connection
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
