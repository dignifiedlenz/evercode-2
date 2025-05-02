'use server'

import { getServerSupabaseClient } from '@/app/lib/supabase-server'
import { NoteContent } from '@/types/note'
import courseData from '@/app/_components/(semester1)/courseData'

export async function getOrCreateNote(chapterId: string, unitId: string, timestamp: number) {
  try {
    const supabase = await getServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.error('Auth error:', authError)
      return { error: 'User not authenticated' }
    }

    // Find the chapter title
    const chapter = courseData.flatMap(sem => sem.chapters).find(ch => ch.id === chapterId)
    const chapterTitle = chapter?.title || 'Untitled Chapter'

    // Try to find existing note for this chapter, ignoring unit_id
    const { data: existingNotes, error: fetchError } = await supabase
      .from('notes')
      .select('id, content')
      .eq('chapter_id', chapterId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

    // If any note exists for this chapter, use the most recent one
    if (existingNotes && existingNotes.length > 0) {
      console.log(`Found existing note for chapter ${chapterId}`);
      return { note: existingNotes[0] }
    }

    // Create new note if none exists for this chapter
    const { data: newNote, error: createError } = await supabase
      .from('notes')
      .insert([
        {
          chapter_id: chapterId,
          unit_id: unitId, // Still store which unit created it initially
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: chapterTitle }]
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: ''
                  }
                ]
              }
            ]
          },
          timestamp,
          user_id: session.user.id
        }
      ])
      .select('id, content')
      .single()

    if (createError) {
      console.error('Create error:', createError)
      throw createError
    }
    console.log(`Created new note for chapter ${chapterId}`);
    return { note: newNote }
  } catch (error) {
    console.error('Error in getOrCreateNote:', error)
    return { error: error instanceof Error ? error.message : 'Failed to get or create note' }
  }
}

export async function updateNote(noteId: string, content: NoteContent, timestamp: number) {
  try {
    const supabase = await getServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.error('Auth error:', authError)
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('notes')
      .update({
        content,
        timestamp,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Update error:', error)
      throw error
    }
    return { success: true }
  } catch (error) {
    console.error('Error in updateNote:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update note' }
  }
}

export async function getNotesByChapter(chapterId: string) {
  try {
    const supabase = await getServerSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.error('Auth error:', authError)
      return { error: 'User not authenticated' }
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      throw error
    }
    return { notes }
  } catch (error) {
    console.error('Error in getNotesByChapter:', error)
    return { error: error instanceof Error ? error.message : 'Failed to fetch notes' }
  }
} 