import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkStatus() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT c.name, COUNT(q.id) as question_count 
      FROM categories c 
      LEFT JOIN questions q ON c.id = q.category_id 
      GROUP BY c.id, c.name 
      ORDER BY c.name
    `);
    
    console.log('Current question counts by category:');
    result.rows.forEach(row => {
      console.log(`${row.name}: ${row.question_count} questions`);
    });
    
    const totalQuestions = await client.query('SELECT COUNT(*) as total FROM questions');
    console.log(`\nTotal questions imported: ${totalQuestions.rows[0].total}`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkStatus();