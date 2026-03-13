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
      amazon_clicks: {
        Row: {
          book_id: string
          book_title: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          book_id: string
          book_title: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          book_id?: string
          book_title?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amazon_clicks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_submissions: {
        Row: {
          author_name: string
          book_title: string
          category: string | null
          created_at: string
          id: string
          language: string | null
          source_link: string | null
          status: string
          submitter_email: string
          submitter_name: string
          why_restore: string
          year_published: string | null
        }
        Insert: {
          author_name: string
          book_title: string
          category?: string | null
          created_at?: string
          id?: string
          language?: string | null
          source_link?: string | null
          status?: string
          submitter_email: string
          submitter_name: string
          why_restore: string
          year_published?: string | null
        }
        Update: {
          author_name?: string
          book_title?: string
          category?: string | null
          created_at?: string
          id?: string
          language?: string | null
          source_link?: string | null
          status?: string
          submitter_email?: string
          submitter_name?: string
          why_restore?: string
          year_published?: string | null
        }
        Relationships: []
      }
      book_votes: {
        Row: {
          book_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_votes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          amazon_link: string | null
          author_id: string | null
          author_name: string
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          ebook_price: number | null
          editorial_description: string | null
          featured: boolean | null
          format: string[] | null
          id: string
          language: string
          preview_content: string | null
          print_price: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amazon_link?: string | null
          author_id?: string | null
          author_name: string
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ebook_price?: number | null
          editorial_description?: string | null
          featured?: boolean | null
          format?: string[] | null
          id?: string
          language?: string
          preview_content?: string | null
          print_price?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amazon_link?: string | null
          author_id?: string | null
          author_name?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ebook_price?: number | null
          editorial_description?: string | null
          featured?: boolean | null
          format?: string[] | null
          id?: string
          language?: string
          preview_content?: string | null
          print_price?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          book_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          featured: boolean
          id: string
          name: string
          perks: string[]
          price: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          perks?: string[]
          price?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          perks?: string[]
          price?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          author_share: number
          book_id: string | null
          buyer_id: string | null
          created_at: string
          id: string
          platform_share: number
          status: string
        }
        Insert: {
          amount: number
          author_share: number
          book_id?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          platform_share: number
          status?: string
        }
        Update: {
          amount?: number
          author_share?: number
          book_id?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          platform_share?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      premium_services: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          suspended: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          suspended?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          suspended?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          book_id: string
          content: string | null
          created_at: string
          flagged: boolean | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          book_id: string
          content?: string | null
          created_at?: string
          flagged?: boolean | null
          id?: string
          rating?: number
          user_id: string
        }
        Update: {
          book_id?: string
          content?: string | null
          created_at?: string
          flagged?: boolean | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          amount: number
          author_id: string
          created_at: string
          id: string
          service_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          author_id: string
          created_at?: string
          id?: string
          service_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          author_id?: string
          created_at?: string
          id?: string
          service_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "premium_services"
            referencedColumns: ["id"]
          },
        ]
      }
      site_features: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          label: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_book_rankings: {
        Args: never
        Returns: {
          avg_rating: number
          book_id: string
          community_score: number
          downvote_count: number
          upvote_count: number
        }[]
      }
      get_book_vote_stats: {
        Args: { p_book_id: string }
        Returns: {
          community_score: number
          downvote_count: number
          upvote_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "author" | "reader"
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
    Enums: {
      app_role: ["admin", "author", "reader"],
    },
  },
} as const
