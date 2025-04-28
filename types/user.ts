import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  auth_id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  lastLoginTime?: Date | null
  deviceType?: string | null
  createdAt: Date
  updatedAt: Date
  avatar_url?: string | null
  progress?: {
    unitProgress: Array<{
      id: string
      chapterId: string
      unitId: string
      questionsCompleted: boolean
      videoCompleted: boolean
    }>
    quizProgress: Array<{
      id: string
      chapterId: string
      quizId: string
      score: number | null
      completed: boolean
    }>
  }
}

export interface AuthUser extends SupabaseUser {
  // user_metadata is already part of SupabaseUser definition or handled by it
} 