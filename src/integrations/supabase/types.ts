export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          handy_id: string
          id: string
          project_id: string | null
          scheduled_at: string
          seeker_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          handy_id: string
          id?: string
          project_id?: string | null
          scheduled_at: string
          seeker_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          handy_id?: string
          id?: string
          project_id?: string | null
          scheduled_at?: string
          seeker_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_diplomas: {
        Row: {
          ai_verification_result: Json | null
          ai_verification_score: number | null
          ai_verification_status: string | null
          created_at: string
          diploma_image_url: string
          diploma_number: string | null
          has_signature: boolean | null
          has_stamp: boolean | null
          id: string
          institution: string | null
          instructor_id: string
          issue_date: string | null
          issue_place: string | null
          training_title: string | null
          verified_at: string | null
        }
        Insert: {
          ai_verification_result?: Json | null
          ai_verification_score?: number | null
          ai_verification_status?: string | null
          created_at?: string
          diploma_image_url: string
          diploma_number?: string | null
          has_signature?: boolean | null
          has_stamp?: boolean | null
          id?: string
          institution?: string | null
          instructor_id: string
          issue_date?: string | null
          issue_place?: string | null
          training_title?: string | null
          verified_at?: string | null
        }
        Update: {
          ai_verification_result?: Json | null
          ai_verification_score?: number | null
          ai_verification_status?: string | null
          created_at?: string
          diploma_image_url?: string
          diploma_number?: string | null
          has_signature?: boolean | null
          has_stamp?: boolean | null
          id?: string
          institution?: string | null
          instructor_id?: string
          issue_date?: string | null
          issue_place?: string | null
          training_title?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructor_diplomas_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          created_at: string
          diploma_verified: boolean | null
          email: string
          experience_verified: boolean | null
          expertise: string[] | null
          full_name: string
          id: string
          identity_verified: boolean | null
          is_online: boolean | null
          phone: string | null
          total_revenue: number | null
          total_students: number | null
          updated_at: string
          user_id: string
          vat_number: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          diploma_verified?: boolean | null
          email: string
          experience_verified?: boolean | null
          expertise?: string[] | null
          full_name: string
          id?: string
          identity_verified?: boolean | null
          is_online?: boolean | null
          phone?: string | null
          total_revenue?: number | null
          total_students?: number | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          diploma_verified?: boolean | null
          email?: string
          experience_verified?: boolean | null
          expertise?: string[] | null
          full_name?: string
          id?: string
          identity_verified?: boolean | null
          is_online?: boolean | null
          phone?: string | null
          total_revenue?: number | null
          total_students?: number | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      lesson_enrollments: {
        Row: {
          completed_at: string | null
          enrolled_at: string
          id: string
          lesson_id: string
          progress_percentage: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          lesson_id: string
          progress_percentage?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          lesson_id?: string
          progress_percentage?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_enrollments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          lesson_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_reviews_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string
          description: string | null
          duration_hours: number | null
          extras: string | null
          id: string
          image_url: string | null
          instructor_id: string
          lesson_type: string | null
          level: string | null
          modules: Json | null
          price: number
          status: string | null
          target_audience: string | null
          title: string
          total_enrollments: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          extras?: string | null
          id?: string
          image_url?: string | null
          instructor_id: string
          lesson_type?: string | null
          level?: string | null
          modules?: Json | null
          price: number
          status?: string | null
          target_audience?: string | null
          title: string
          total_enrollments?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          extras?: string | null
          id?: string
          image_url?: string | null
          instructor_id?: string
          lesson_type?: string | null
          level?: string | null
          modules?: Json | null
          price?: number
          status?: string | null
          target_audience?: string | null
          title?: string
          total_enrollments?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_online: boolean | null
          location: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_online?: boolean | null
          location?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
