// types/note.ts

export interface NoteContent {
    type: string;
    content: Array<{
      type: string;
      content?: Array<{
        type: string;
        text?: string;
      }>;
    }>;
  }
  