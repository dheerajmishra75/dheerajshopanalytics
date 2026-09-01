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
      customers: {
        Row: {
          city: string | null
          customer_id: number
          email: string | null
          name: string | null
          signup_date: string | null
        }
        Insert: {
          city?: string | null
          customer_id?: number
          email?: string | null
          name?: string | null
          signup_date?: string | null
        }
        Update: {
          city?: string | null
          customer_id?: number
          email?: string | null
          name?: string | null
          signup_date?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          order_id: number | null
          order_item_id: number
          product_id: number | null
          quantity: number | null
        }
        Insert: {
          order_id?: number | null
          order_item_id?: number
          product_id?: number | null
          quantity?: number | null
        }
        Update: {
          order_id?: number | null
          order_item_id?: number
          product_id?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_detail"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          customer_id: number | null
          order_date: string | null
          order_id: number
          order_status: string | null
        }
        Insert: {
          customer_id?: number | null
          order_date?: string | null
          order_id?: number
          order_status?: string | null
        }
        Update: {
          customer_id?: number | null
          order_date?: string | null
          order_id?: number
          order_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          order_id: number | null
          payment_date: string | null
          payment_id: number
          payment_mode: string | null
        }
        Insert: {
          amount?: number | null
          order_id?: number | null
          payment_date?: string | null
          payment_id?: number
          payment_mode?: string | null
        }
        Update: {
          amount?: number | null
          order_id?: number | null
          payment_date?: string | null
          payment_id?: number
          payment_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_orders_detail"
            referencedColumns: ["order_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          price: number | null
          product_id: number
          product_name: string | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          price?: number | null
          product_id?: number
          product_name?: string | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          price?: number | null
          product_id?: number
          product_name?: string | null
          stock?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      v_best_selling_products: {
        Row: {
          category: string | null
          product_name: string | null
          units_sold: number | null
        }
        Relationships: []
      }
      v_category_contribution: {
        Row: {
          category: string | null
          revenue_contribution: number | null
          revenue_contribution_percentage: number | null
        }
        Relationships: []
      }
      v_category_performance: {
        Row: {
          category: string | null
          revenue: number | null
          units_sold: number | null
        }
        Relationships: []
      }
      v_city_revenue: {
        Row: {
          city: string | null
          city_revenue: number | null
        }
        Relationships: []
      }
      v_daily_revenue: {
        Row: {
          daily_revenue: number | null
          order_date: string | null
          orders: number | null
        }
        Relationships: []
      }
      v_kpi_overview: {
        Row: {
          average_order_value: number | null
          cancelled_orders: number | null
          delivered_orders: number | null
          pending_orders: number | null
          total_orders: number | null
          total_revenue: number | null
          units_sold: number | null
        }
        Relationships: []
      }
      v_low_stock_products: {
        Row: {
          category: string | null
          product_name: string | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          product_name?: string | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          product_name?: string | null
          stock?: number | null
        }
        Relationships: []
      }
      v_never_ordered_products: {
        Row: {
          category: string | null
          product_name: string | null
          stock: number | null
        }
        Relationships: []
      }
      v_order_status_breakdown: {
        Row: {
          order_status: string | null
          percentage: number | null
          total_orders: number | null
        }
        Relationships: []
      }
      v_orders_detail: {
        Row: {
          city: string | null
          customer_name: string | null
          order_date: string | null
          order_id: number | null
          order_status: string | null
          paid_amount: number | null
          payment_mode: string | null
          units: number | null
        }
        Relationships: []
      }
      v_payment_methods: {
        Row: {
          payment_mode: string | null
          revenue: number | null
          transactions: number | null
        }
        Relationships: []
      }
      v_product_revenue: {
        Row: {
          category: string | null
          product_name: string | null
          revenue: number | null
          units_sold: number | null
        }
        Relationships: []
      }
      v_repeat_customers: {
        Row: {
          city: string | null
          name: string | null
          repeat_order: number | null
        }
        Relationships: []
      }
      v_top_customers: {
        Row: {
          city: string | null
          name: string | null
          total_spent: number | null
        }
        Relationships: []
      }
      v_top3_products_per_category: {
        Row: {
          category: string | null
          product_name: string | null
          product_rank: number | null
          units_sold: number | null
        }
        Relationships: []
      }
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
