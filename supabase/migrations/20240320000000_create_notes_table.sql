-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":""}]}]}'::jsonb,
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_chapter_id_idx ON public.notes(chapter_id);
CREATE INDEX IF NOT EXISTS notes_unit_id_idx ON public.notes(unit_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Ensure RLS is enabled
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper permissions
-- Policy for SELECT: Users can only read their own notes
CREATE POLICY "Users can view their own notes"
    ON public.notes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for INSERT: Users can only insert notes for themselves
CREATE POLICY "Users can insert their own notes"
    ON public.notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can only update their own notes
CREATE POLICY "Users can update their own notes"
    ON public.notes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can only delete their own notes
CREATE POLICY "Users can delete their own notes"
    ON public.notes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Ensure proper permissions are granted
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_notes_updated_at ON public.notes;

-- Create the trigger
CREATE TRIGGER handle_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 