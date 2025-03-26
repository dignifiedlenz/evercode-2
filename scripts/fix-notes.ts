import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNotes() {
  try {
    // Get all notes
    const notes = await prisma.note.findMany();
    console.log(`Found ${notes.length} notes to check`);

    let fixedCount = 0;
    let deletedCount = 0;

    for (const note of notes) {
      // Check for invalid or missing fields
      if (!note.chapterId || !note.unitId || !note.content) {
        console.log(`Found note with missing fields: ${note.id}`);
        try {
          await prisma.note.delete({
            where: { id: note.id }
          });
          deletedCount++;
          console.log(`Deleted note: ${note.id}`);
        } catch (error) {
          console.error(`Failed to delete note ${note.id}:`, error);
        }
        continue;
      }

      // Check for malformed content
      try {
        JSON.parse(note.content);
      } catch (error) {
        console.log(`Found note with malformed content: ${note.id}`);
        try {
          await prisma.note.update({
            where: { id: note.id },
            data: {
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
          });
          fixedCount++;
          console.log(`Fixed note: ${note.id}`);
        } catch (error) {
          console.error(`Failed to fix note ${note.id}:`, error);
          try {
            await prisma.note.delete({
              where: { id: note.id }
            });
            deletedCount++;
            console.log(`Deleted unfixable note: ${note.id}`);
          } catch (error) {
            console.error(`Failed to delete unfixable note ${note.id}:`, error);
          }
        }
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Fixed notes: ${fixedCount}`);
    console.log(`- Deleted notes: ${deletedCount}`);
    console.log(`- Total notes remaining: ${notes.length - deletedCount}`);

  } catch (error) {
    console.error('Error fixing notes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNotes(); 