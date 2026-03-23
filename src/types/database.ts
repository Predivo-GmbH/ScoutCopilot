// ScoutCopilot — Supabase Database Types
// Auto-generated pattern, keep in sync with migrations

export type SubscriptionTier = "scout" | "pro" | "club";
export type UserRole = "owner" | "admin" | "scout";
export type DataProvider = "wyscout" | "statsbomb";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subscription_tier: SubscriptionTier;
          max_seats: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          subscription_tier?: SubscriptionTier;
          max_seats?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          subscription_tier?: SubscriptionTier;
          max_seats?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string | null;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      api_credentials: {
        Row: {
          id: string;
          organization_id: string;
          provider: DataProvider;
          encrypted_credentials: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          provider: DataProvider;
          encrypted_credentials: Record<string, unknown>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: DataProvider;
          encrypted_credentials?: Record<string, unknown>;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      search_queries: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          query_text: string;
          parsed_parameters: Record<string, unknown> | null;
          result_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          query_text: string;
          parsed_parameters?: Record<string, unknown> | null;
          result_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          query_text?: string;
          parsed_parameters?: Record<string, unknown> | null;
          result_count?: number;
          updated_at?: string;
        };
      };
      search_results: {
        Row: {
          id: string;
          search_query_id: string;
          player_external_id: string;
          player_name: string;
          player_data: Record<string, unknown>;
          rank: number;
          fit_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          search_query_id: string;
          player_external_id: string;
          player_name: string;
          player_data: Record<string, unknown>;
          rank: number;
          fit_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          player_data?: Record<string, unknown>;
          rank?: number;
          fit_score?: number | null;
          updated_at?: string;
        };
      };
      player_reports: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          player_external_id: string;
          player_name: string;
          report_data: Record<string, unknown>;
          source_provider: DataProvider;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          player_external_id: string;
          player_name: string;
          report_data: Record<string, unknown>;
          source_provider: DataProvider;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          player_name?: string;
          report_data?: Record<string, unknown>;
          source_provider?: DataProvider;
          updated_at?: string;
        };
      };
      player_comparisons: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          title: string;
          player_ids: string[];
          comparison_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          title: string;
          player_ids: string[];
          comparison_data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          player_ids?: string[];
          comparison_data?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          name: string;
          description: string | null;
          is_shared: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          name: string;
          description?: string | null;
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_shared?: boolean;
          updated_at?: string;
        };
      };
      watchlist_players: {
        Row: {
          id: string;
          watchlist_id: string;
          player_external_id: string;
          player_name: string;
          player_data: Record<string, unknown> | null;
          notes: string | null;
          added_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          player_external_id: string;
          player_name: string;
          player_data?: Record<string, unknown> | null;
          notes?: string | null;
          added_at?: string;
          updated_at?: string;
        };
        Update: {
          player_name?: string;
          player_data?: Record<string, unknown> | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          organization_id: string;
          month: string;
          api_calls_count: number;
          reports_generated: number;
          searches_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          month: string;
          api_calls_count?: number;
          reports_generated?: number;
          searches_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          api_calls_count?: number;
          reports_generated?: number;
          searches_count?: number;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_user_organization_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      subscription_tier: SubscriptionTier;
      user_role: UserRole;
      data_provider: DataProvider;
    };
  };
};

// Convenience type aliases
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ApiCredential = Database["public"]["Tables"]["api_credentials"]["Row"];
export type SearchQuery = Database["public"]["Tables"]["search_queries"]["Row"];
export type SearchResult = Database["public"]["Tables"]["search_results"]["Row"];
export type PlayerReport = Database["public"]["Tables"]["player_reports"]["Row"];
export type PlayerComparison = Database["public"]["Tables"]["player_comparisons"]["Row"];
export type Watchlist = Database["public"]["Tables"]["watchlists"]["Row"];
export type WatchlistPlayer = Database["public"]["Tables"]["watchlist_players"]["Row"];
export type UsageTracking = Database["public"]["Tables"]["usage_tracking"]["Row"];
