import fs from 'fs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Optimized category mapping based on actual analysis of the JSON files
const categoryMapping = {
  'ALL': 1, // Aircraft Maintenance
  'REC': 2, // Reciprocating Engines  
  'TUR': 3, // Turbine Engines
};

async function fastImport() {
  const client = await pool.connect();
  
  try {
    // First, get the actual category IDs from the database
    const categoryResults = await client.query(`
      SELECT id, name FROM categories ORDER BY id
    `);
    console.log('Available categories:');
    categoryResults.rows.forEach(row => {
      console.log(`${row.id}: ${row.name}`);
    });

    // Update mapping with actual IDs
    const recipCat = categoryResults.rows.find(c => c.name.includes('Reciprocating'));
    const turbineCat = categoryResults.rows.find(c => c.name.includes('Turbine'));
    
    if (recipCat) categoryMapping['REC'] = recipCat.id;
    if (turbineCat) categoryMapping['TUR'] = turbineCat.id;

    // Process prep 1 file (if not fully imported)
    const data1 = JSON.parse(fs.readFileSync('./attached_assets/prep 1 final_1751299266580.json', 'utf8'));
    console.log(`Processing ${data1.length} questions from prep 1 file...`);
    
    let imported1 = 0;
    for (let i = 0; i < data1.length; i++) {
      const item = data1[i];
      
      if (i % 100 === 0) {
        console.log(`Progress: ${i}/${data1.length} questions processed`);
      }
      
      try {
        const categoryId = categoryMapping[item.Category] || 1;
        let explanation = item['Explanation (General)'] || '';
        if (explanation.includes('|')) {
          explanation = explanation.replace(/\|/g, '\n');
        }
        
        await client.query(`
          INSERT INTO questions (
            category_id, 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_answer, 
            explanation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          categoryId,
          item.Question,
          item['Answer A'] || '',
          item['Answer B'] || '',
          item['Answer C'] || '',
          item['Answer D'] || '',
          item['Correct Answer'] || 'A',
          explanation
        ]);
        
        imported1++;
      } catch (error) {
        if (!error.message.includes('duplicate key')) {
          console.log(`Error on question ${i}:`, error.message.substring(0, 100));
        }
      }
    }
    
    console.log(`Prep 1 file: ${imported1} new questions imported`);

    // Process prep 2 file
    const data2 = JSON.parse(fs.readFileSync('./attached_assets/prep 2 final_1751299277605.json', 'utf8'));
    console.log(`Processing ${data2.length} questions from prep 2 file...`);
    
    let imported2 = 0;
    for (let i = 0; i < data2.length; i++) {
      const item = data2[i];
      
      if (i % 100 === 0) {
        console.log(`Progress: ${i}/${data2.length} questions processed`);
      }
      
      try {
        const categoryId = categoryMapping[item.Category] || 1;
        let explanation = item['Explanation (General)'] || '';
        if (explanation.includes('|')) {
          explanation = explanation.replace(/\|/g, '\n');
        }
        
        await client.query(`
          INSERT INTO questions (
            category_id, 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_answer, 
            explanation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          categoryId,
          item.Question,
          item['Answer A'] || '',
          item['Answer B'] || '',
          item['Answer C'] || '',
          item['Answer D'] || '',
          item['Correct Answer'] || 'A',
          explanation
        ]);
        
        imported2++;
      } catch (error) {
        if (!error.message.includes('duplicate key')) {
          console.log(`Error on question ${i}:`, error.message.substring(0, 100));
        }
      }
    }
    
    console.log(`Prep 2 file: ${imported2} new questions imported`);

    // Final count
    const finalResult = await client.query(`
      SELECT c.name, COUNT(q.id) as question_count 
      FROM categories c 
      LEFT JOIN questions q ON c.id = q.category_id 
      GROUP BY c.id, c.name 
      ORDER BY c.name
    `);
    
    console.log('\nFinal question counts by category:');
    finalResult.rows.forEach(row => {
      console.log(`${row.name}: ${row.question_count} questions`);
    });
    
    const totalQuestions = await client.query('SELECT COUNT(*) as total FROM questions');
    console.log(`\nTotal questions in database: ${totalQuestions.rows[0].total}`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

fastImport().catch(console.error);