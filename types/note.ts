// types/note.ts

export interface NoteContent {
    type: string;
    content: Array<{
      type: string;
      attrs?: Record<string, any>;
      content?: Array<NoteContent>;
    }>;
  }
  