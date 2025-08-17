import fs from 'fs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Category mapping from file codes to database IDs
const categoryMapping = {
  'ALL': 1, // Aircraft Maintenance (covers wood structure, covering, finishes, sheet metal, etc.)
  'REC': 'reciprocating', // Will need to create reciprocating engine category
  'TUR': 'turbine', // Will need to create turbine engine category
  // Add more mappings as needed
};

// Subtopic mapping based on the requirements
const subtopicMapping = {
  // Aircraft Maintenance category subtopics
  1: { name: 'Wood Structure', expectedCount: 16, categoryId: 1 },
  2: { name: 'Aircraft Covering', expectedCount: 11, categoryId: 1 },
  3: { name: 'Aircraft Finishes', expectedCount: 15, categoryId: 1 },
  4: { name: 'Sheet Metal and Non-Metallic Structure', expectedCount: 140, categoryId: 1 },
  5: { name: 'Welding', expectedCount: 34, categoryId: 1 },
  6: { name: 'Assembly and Rigging', expectedCount: 81, categoryId: 1 },
  7: { name: 'Airframe Inspection', expectedCount: 12, categoryId: 1 },
  8: { name: 'Aircraft Landing Gear System', expectedCount: 81, categoryId: 1 },
  9: { name: 'Hydraulic and Pneumatic Power System', expectedCount: 113, categoryId: 1 },
  10: { name: 'Cabin Atmosphere Control System', expectedCount: 89, categoryId: 1 },
  11: { name: 'Aircraft Instruments', expectedCount: 61, categoryId: 1 },
  12: { name: 'Communication and Navigation System', expectedCount: 50, categoryId: 1 },
  13: { name: 'Aircraft Fuel System', expectedCount: 114, categoryId: 1 },
  14: { name: 'Aircraft Electrical Systems', expectedCount: 132, categoryId: 1 },
  15: { name: 'Position and Warning Systems', expectedCount: 35, categoryId: 1 },
  16: { name: 'Ice and Rain Control System', expectedCount: 28, categoryId: 1 },
  17: { name: 'Fire Protection Systems', expectedCount: 32, categoryId: 1 },
  
  // Reciprocating Engine subtopics
  18: { name: 'Reciprocating Engine', expectedCount: 107, categoryId: 'reciprocating' },
  19: { name: 'Engine Inspections', expectedCount: 29, categoryId: 'reciprocating' },
  20: { name: 'Engine Instrument Systems', expectedCount: 53, categoryId: 'reciprocating' },
  21: { name: 'Engine Fire Protection System', expectedCount: 32, categoryId: 'reciprocating' },
  22: { name: 'Engine Electrical Systems', expectedCount: 69, categoryId: 'reciprocating' },
  23: { name: 'Lubrication Systems', expectedCount: 93, categoryId: 'reciprocating' },
  24: { name: 'Ignition and Starting System', expectedCount: 132, categoryId: 'reciprocating' },
  25: { name: 'Fuel Metering Systems', expectedCount: 98, categoryId: 'reciprocating' },
  26: { name: 'Engine Fuel Systems', expectedCount: 40, categoryId: 'reciprocating' },
  27: { name: 'Induction and Engine Airflow System', expectedCount: 43, categoryId: 'reciprocating' },
  28: { name: 'Engine Cooling System', expectedCount: 32, categoryId: 'reciprocating' },
  29: { name: 'Engine Exhaust and Reverser Systems', expectedCount: 35, categoryId: 'reciprocating' },
  30: { name: 'Propellers', expectedCount: 117, categoryId: 'reciprocating' },
  31: { name: 'Auxiliary Power Units', expectedCount: 10, categoryId: 'reciprocating' },
  
  // Turbine Engine subtopics
  32: { name: 'Turbine Engines', expectedCount: 121, categoryId: 'turbine' }
};

async function createCategoriesAndSubtopics() {
  const client = await pool.connect();
  
  try {
    // First, modify the categories table to make question_count nullable
    await client.query(`
      ALTER TABLE categories ALTER COLUMN question_count DROP NOT NULL;
      ALTER TABLE categories ALTER COLUMN time_limit DROP NOT NULL;
    `);
    
    // Create Reciprocating Engine category
    const recipResult = await client.query(`
      INSERT INTO categories (name, slug, description, question_count, time_limit) 
      VALUES ($1, $2, $3, 0, 60) 
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['Reciprocating Engines', 'reciprocating-engines', 'Reciprocating engine systems and components']);
    
    const reciprocatingCategoryId = recipResult.rows[0].id;
    
    // Create Turbine Engine category
    const turbineResult = await client.query(`
      INSERT INTO categories (name, slug, description, question_count, time_limit) 
      VALUES ($1, $2, $3, 0, 60) 
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['Turbine Engines', 'turbine-engines', 'Turbine engine systems and components']);
    
    const turbineCategoryId = turbineResult.rows[0].id;
    
    // Update category mapping with actual IDs
    categoryMapping['REC'] = reciprocatingCategoryId;
    categoryMapping['TUR'] = turbineCategoryId;
    
    // Update subtopic mapping with actual category IDs
    Object.keys(subtopicMapping).forEach(key => {
      if (subtopicMapping[key].categoryId === 'reciprocating') {
        subtopicMapping[key].categoryId = reciprocatingCategoryId;
      } else if (subtopicMapping[key].categoryId === 'turbine') {
        subtopicMapping[key].categoryId = turbineCategoryId;
      }
    });
    
    // Create subtopics
    for (const [subtopicNum, subtopicData] of Object.entries(subtopicMapping)) {
      const slug = subtopicData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      try {
        await client.query(`
          INSERT INTO subtopics (category_id, name, slug) 
          VALUES ($1, $2, $3) 
        `, [subtopicData.categoryId, subtopicData.name, slug]);
      } catch (error) {
        if (error.code !== '23505') { // Ignore unique constraint violations
          console.log(`Subtopic creation error for ${subtopicData.name}:`, error.message);
        }
      }
    }
    
    console.log('Categories and subtopics created successfully');
    
  } catch (error) {
    console.log('Database modification error (likely already applied):', error.message);
  } finally {
    client.release();
  }
}

async function importQuestions(filePath) {
  const client = await pool.connect();
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Processing ${data.length} questions from ${filePath}`);
    
    for (const item of data) {
      // Map category
      let categoryId = categoryMapping[item.Category];
      if (!categoryId) {
        console.log(`Unknown category: ${item.Category}, defaulting to Aircraft Maintenance`);
        categoryId = 1; // Default to Aircraft Maintenance
      }
      
      // Find subtopic ID
      const subtopicData = Object.values(subtopicMapping).find(s => 
        s.categoryId === categoryId && 
        (item['Subtopic (Chapter)'] === parseInt(Object.keys(subtopicMapping).find(k => subtopicMapping[k] === s)))
      );
      
      let subtopicId = null;
      if (subtopicData) {
        const subtopicResult = await client.query(
          'SELECT id FROM subtopics WHERE category_id = $1 AND name = $2',
          [categoryId, subtopicData.name]
        );
        if (subtopicResult.rows.length > 0) {
          subtopicId = subtopicResult.rows[0].id;
        }
      }
      
      // If no specific subtopic found, try to map by chapter number
      if (!subtopicId) {
        const chapterNum = item['Subtopic (Chapter)'];
        if (chapterNum && subtopicMapping[chapterNum]) {
          const defaultSubtopic = subtopicMapping[chapterNum];
          const subtopicResult = await client.query(
            'SELECT id FROM subtopics WHERE category_id = $1 AND name = $2',
            [defaultSubtopic.categoryId, defaultSubtopic.name]
          );
          if (subtopicResult.rows.length > 0) {
            subtopicId = subtopicResult.rows[0].id;
          }
        }
      }
      
      // Default subtopic if none found
      if (!subtopicId) {
        // Create a general subtopic for this category
        const generalSubtopicName = categoryId === 1 ? 'General Aircraft Maintenance' : 
                                   categoryId === categoryMapping['REC'] ? 'General Reciprocating Engine' : 
                                   'General Turbine Engine';
        
        const subtopicResult = await client.query(`
          INSERT INTO subtopics (category_id, name, description) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (category_id, name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [categoryId, generalSubtopicName, `General ${generalSubtopicName} questions`]);
        
        subtopicId = subtopicResult.rows[0].id;
      }
      
      // Prepare explanation
      let explanation = item['Explanation (General)'] || '';
      if (explanation.includes('|')) {
        explanation = explanation.replace(/\|/g, '\n');
      }
      
      // Get correct answer letter
      const correctAnswerLetter = item['Correct Answer'] || 'A';
      
      // Insert question
      try {
        await client.query(`
          INSERT INTO questions (
            category_id, 
            subtopic_id, 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_answer, 
            explanation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          categoryId,
          subtopicId,
          item.Question,
          item['Answer A'] || '',
          item['Answer B'] || '',
          item['Answer C'] || '',
          item['Answer D'] || '',
          correctAnswerLetter,
          explanation
        ]);
      } catch (error) {
        console.error(`Error inserting question: ${item.Question.substring(0, 50)}...`, error.message);
      }
    }
    
    console.log(`Finished processing ${filePath}`);
    
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('Creating categories and subtopics...');
    await createCategoriesAndSubtopics();
    
    console.log('Importing questions from prep 1 file...');
    await importQuestions('./attached_assets/prep 1 final_1751299266580.json');
    
    console.log('Importing questions from prep 2 file...');
    await importQuestions('./attached_assets/prep 2 final_1751299277605.json');
    
    console.log('Import completed successfully!');
    
    // Print summary
    const client = await pool.connect();
    try {
      const categoryStats = await client.query(`
        SELECT c.name, COUNT(q.id) as question_count
        FROM categories c
        LEFT JOIN questions q ON c.id = q.category_id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `);
      
      console.log('\nCategory Summary:');
      categoryStats.rows.forEach(row => {
        console.log(`${row.name}: ${row.question_count} questions`);
      });
      
      const subtopicStats = await client.query(`
        SELECT c.name as category, s.name as subtopic, COUNT(q.id) as question_count
        FROM categories c
        JOIN subtopics s ON c.id = s.category_id
        LEFT JOIN questions q ON s.id = q.subtopic_id
        GROUP BY c.id, c.name, s.id, s.name
        ORDER BY c.name, s.name
      `);
      
      console.log('\nSubtopic Summary:');
      subtopicStats.rows.forEach(row => {
        console.log(`${row.category} -> ${row.subtopic}: ${row.question_count} questions`);
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

main();