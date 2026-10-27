export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          normalized_name: string;
          phone_optional: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          normalized_name: string;
          phone_optional?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          normalized_name?: string;
          phone_optional?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          store_id: string;
          image_path: string;
          page_date: string | null;
          written_total: number | null;
          computed_total: number;
          has_page_discrepancy: boolean;
          status: "processing" | "needs_review" | "retake_requested" | "confirmed";
          retake_reason: string | null;
          model: string;
          latency_ms: number | null;
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          store_id: string;
          image_path: string;
          page_date?: string | null;
          written_total?: number | null;
          computed_total?: number;
          has_page_discrepancy?: boolean;
          status?: "processing" | "needs_review" | "retake_requested" | "confirmed";
          retake_reason?: string | null;
          model?: string;
          latency_ms?: number | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          store_id?: string;
          image_path?: string;
          page_date?: string | null;
          written_total?: number | null;
          computed_total?: number;
          has_page_discrepancy?: boolean;
          status?: "processing" | "needs_review" | "retake_requested" | "confirmed";
          retake_reason?: string | null;
          model?: string;
          latency_ms?: number | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          page_id: string;
          store_id: string;
          customer_id: string | null;
          extracted_customer_name: string | null;
          item: string;
          quantity: number | null;
          unit_price: number | null;
          amount: number;
          entry_type: "credit" | "payment" | "cash_sale";
          line_discrepancy: boolean;
          confidence: number;
          needs_review: boolean;
          confirmed_by_user: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          store_id: string;
          customer_id?: string | null;
          extracted_customer_name?: string | null;
          item: string;
          quantity?: number | null;
          unit_price?: number | null;
          amount: number;
          entry_type?: "credit" | "payment" | "cash_sale";
          line_discrepancy?: boolean;
          confidence?: number;
          needs_review?: boolean;
          confirmed_by_user?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          store_id?: string;
          customer_id?: string | null;
          extracted_customer_name?: string | null;
          item?: string;
          quantity?: number | null;
          unit_price?: number | null;
          amount?: number;
          entry_type?: "credit" | "payment" | "cash_sale";
          line_discrepancy?: boolean;
          confidence?: number;
          needs_review?: boolean;
          confirmed_by_user?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          tone: "friendly" | "firm";
          message: string;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          tone?: "friendly" | "firm";
          message: string;
          model?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          tone?: "friendly" | "firm";
          message?: string;
          model?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
