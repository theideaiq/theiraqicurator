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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artworks: {
        Row: {
          artist: string
          audio_url: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          position_x: number | null
          position_y: number | null
          position_z: number | null
          title: string
          language: string
        }
        Insert: {
          artist: string
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          title: string
          language?: string
        }
        Update: {
          artist?: string
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          title?: string
          language?: string
        }
        Relationships: []
      }
      curations: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean | null
          slug: string
          title: string
          language: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug: string
          title: string
          language?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string
          title?: string
          language?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          blurb_ar: string
          blurb_en: string
          color: string
          created_at: string
          duration_minutes: number
          id: string
          kind: string
          link_url: string | null
          partners: string[]
          published: boolean
          slug: string
          starts_at: string | null
          title_ar: string
          title_en: string
          venue_ar: string
          venue_en: string
        }
        Insert: {
          blurb_ar?: string
          blurb_en?: string
          color?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          kind?: string
          link_url?: string | null
          partners?: string[]
          published?: boolean
          slug: string
          starts_at?: string | null
          title_ar?: string
          title_en: string
          venue_ar?: string
          venue_en?: string
        }
        Update: {
          blurb_ar?: string
          blurb_en?: string
          color?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          kind?: string
          link_url?: string | null
          partners?: string[]
          published?: boolean
          slug?: string
          starts_at?: string | null
          title_ar?: string
          title_en?: string
          venue_ar?: string
          venue_en?: string
        }
        Relationships: []
      }
      manifesto_rules: {
        Row: {
          created_at: string
          id: string
          published: boolean
          rule_ar: string
          rule_en: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          published?: boolean
          rule_ar?: string
          rule_en: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          published?: boolean
          rule_ar?: string
          rule_en?: string
          sort?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          read: boolean
          topic: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          read?: boolean
          topic?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          read?: boolean
          topic?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          kind: string
          name_ar: string
          name_en: string
          note_ar: string
          note_en: string
          published: boolean
          sort: number
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          name_ar?: string
          name_en: string
          note_ar?: string
          note_en?: string
          published?: boolean
          sort?: number
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          name_ar?: string
          name_en?: string
          note_ar?: string
          note_en?: string
          published?: boolean
          sort?: number
          url?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          answer: number
          created_at: string
          id: string
          options: Json
          published: boolean
          question_ar: string
          question_en: string
          sort: number
          why_ar: string
          why_en: string
        }
        Insert: {
          answer?: number
          created_at?: string
          id?: string
          options?: Json
          published?: boolean
          question_ar?: string
          question_en: string
          sort?: number
          why_ar?: string
          why_en?: string
        }
        Update: {
          answer?: number
          created_at?: string
          id?: string
          options?: Json
          published?: boolean
          question_ar?: string
          question_en?: string
          sort?: number
          why_ar?: string
          why_en?: string
        }
        Relationships: []
      }
      syllabus_artists: {
        Row: {
          created_at: string
          disciplines: string[]
          id: string
          name_ar: string
          name_en: string
          note_ar: string
          note_en: string
          published: boolean
          sort: number
          years: string
        }
        Insert: {
          created_at?: string
          disciplines?: string[]
          id?: string
          name_ar?: string
          name_en: string
          note_ar?: string
          note_en?: string
          published?: boolean
          sort?: number
          years?: string
        }
        Update: {
          created_at?: string
          disciplines?: string[]
          id?: string
          name_ar?: string
          name_en?: string
          note_ar?: string
          note_en?: string
          published?: boolean
          sort?: number
          years?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          email: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean }
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
