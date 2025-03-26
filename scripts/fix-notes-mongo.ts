import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNotes() {
  try {
    // Get the database URL from Prisma
    const url = prisma.$connect().catch(() => null);
    if (!url) {
      console.error('Could not connect to database');
      process.exit(1);
    }

    const client = new MongoClient(process.env.DATABASE_URL || '');

    try {
      await client.connect();
      console.log('Connected to MongoDB');

      const db = client.db();
      const notesCollection = db.collection('Note');

      // Delete notes with missing required fields
      const deleteResult = await notesCollection.deleteMany({
        $or: [
          { chapterId: null },
          { unitId: null },
          { content: null },
          { chapterId: { $exists: false } },
          { unitId: { $exists: false } },
          { content: { $exists: false } }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} notes with missing fields`);

      // Find notes with malformed content
      const notes = await notesCollection.find({}).toArray();
      console.log(`Found ${notes.length} remaining notes to check content`);

      let fixedCount = 0;
      let deletedCount = 0;

      for (const note of notes) {
        try {
          if (note.content) {
            JSON.parse(note.content);
          }
        } catch (error) {
          console.log(`Found note with malformed content: ${note._id}`);
          try {
            // Try to fix the note
            await notesCollection.updateOne(
              { _id: note._id },
              {
                $set: {
                  content: JSON.stringify({
                    type: "doc",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            content: []
                          }
                        ]
                      }
                    ]
                  })
                }
              }
            );
            fixedCount++;
            console.log(`Fixed note: ${note._id}`);
          } catch (error) {
            // If we can't fix it, delete it
            try {
              await notesCollection.deleteOne({ _id: note._id });
              deletedCount++;
              console.log(`Deleted unfixable note: ${note._id}`);
            } catch (error) {
              console.error(`Failed to delete unfixable note ${note._id}:`, error);
            }
          }
        }
      }

      console.log(`\nSummary:`);
      console.log(`- Deleted notes with missing fields: ${deleteResult.deletedCount}`);
      console.log(`- Fixed malformed notes: ${fixedCount}`);
      console.log(`- Deleted unfixable notes: ${deletedCount}`);
      console.log(`- Total notes remaining: ${notes.length - deletedCount}`);

    } catch (error) {
      console.error('Error fixing notes:', error);
    } finally {
      await client.close();
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

fixNotes(); 