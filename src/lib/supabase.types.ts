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
      files: {
        Row: {
          id: string
          created_at: string
          name: string
          size: number
          type: string
          url: string
          user_id: string
          key: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          size: number
          type: string
          url: string
          user_id: string
          key: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          size?: number
          type?: string
          url?: string
          user_id?: string
          key?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 