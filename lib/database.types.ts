export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          currency: string
          language: string
          date_format: string
          export_format: string
          notifications: any
          privacy: any
          ai_preferences: any
          notification_times: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          currency?: string
          language?: string
          date_format?: string
          export_format?: string
          notifications?: any
          privacy?: any
          ai_preferences?: any
          notification_times?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          currency?: string
          language?: string
          date_format?: string
          export_format?: string
          notifications?: any
          privacy?: any
          ai_preferences?: any
          notification_times?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
