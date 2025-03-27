const { MongoClient } = require('mongodb');
require('dotenv').config();

async function updateUsers() {
  const client = new MongoClient(process.env.DATABASE_URL);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to database');
    
    const result = await db.collection('User').updateMany(
      {},
      { $unset: { 
          lastCompletedSession: "",
          completedChapters: "",
          completedUnits: ""
        } 
      }
    );
    
    console.log(`Modified ${result.modifiedCount} users`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from database');
  }
}

updateUsers(); 