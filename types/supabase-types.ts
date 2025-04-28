// This file defines the types for your Supabase database
// Generated types for better typesafety with the Supabase client

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Define your tables here 
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          firstName?: string
          lastName?: string
          role: string
          createdAt: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          firstName?: string
          lastName?: string
          role: string
          createdAt?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          firstName?: string
          lastName?: string
          role?: string
          createdAt?: string
        }
      }
      // You can add more tables here if needed
    }
    Views: {
      // Define your views here
    }
    Functions: {
      // Define any database functions here
    }
    Enums: {
      // Define any custom enums here
    }
  }
} 