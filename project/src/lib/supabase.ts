import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

// Support both the legacy JWT anon key (VITE_SUPABASE_ANON_KEY) and the newer
// publishable key format (VITE_SUPABASE_PUBLISHABLE_KEY).  The anon key takes
// priority because it works with all PostgREST versions without extra steps.
const supabaseKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

if (!supabaseUrl || supabaseUrl.trim() === '') {
  console.error('[Supabase] VITE_SUPABASE_URL is missing — check your .env.local');
}
if (!supabaseKey || supabaseKey.trim() === '') {
  console.error(
    '[Supabase] API key is missing — set VITE_SUPABASE_ANON_KEY (preferred) or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // PKCE avoids putting tokens in the URL fragment, which conflicts with HashRouter
    flowType: 'pkce',
  },
});

/** Quick ping — resolves true if the DB is reachable, false otherwise. */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      return { ok: false, error: `${error.code}: ${error.message}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          email: string;
          avatar_url: string | null;
          avatar_seed: string | null;
          role: 'customer' | 'super_admin' | 'store_admin' | 'cashier';
          level: number;
          xp: number;
          xp_to_next: number;
          total_points: number;
          current_points: number;
          streak: number;
          phone: string | null;
          bio: string | null;
          status: 'active' | 'suspended' | 'deleted';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      rewards: {
        Row: {
          id: string;
          title: string;
          description: string;
          points: number;
          category: string;
          image: string | null;
          featured: boolean;
          limited: boolean;
          stock: number;
          expires_at: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rewards']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rewards']['Insert']>;
      };
      redemptions: {
        Row: {
          id: string;
          user_id: string;
          reward_id: string;
          points_spent: number;
          code: string;
          barcode: string | null;
          used: boolean;
          used_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['redemptions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['redemptions']['Insert']>;
      };
      points_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'earned' | 'spent' | 'adjusted' | 'expired';
          amount: number;
          description: string;
          category: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['points_transactions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['points_transactions']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          points: number;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          total: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_achievements']['Insert']>;
      };
      missions: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          points: number;
          category: 'daily' | 'weekly' | 'special';
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['missions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['missions']['Insert']>;
      };
      user_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          completed: boolean;
          completed_at: string | null;
          reset_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_missions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_missions']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          image: string | null;
          start_date: string;
          end_date: string;
          active: boolean;
          multiplier: string | null;
          color: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          username: string;
          email: string;
          role: string;
          action: string;
          action_type: string;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          device_type: string | null;
          device_name: string | null;
          browser: string | null;
          os: string | null;
          country: string | null;
          city: string | null;
          region: string | null;
          isp: string | null;
          timezone: string | null;
          amount: number | null;
          risk_level: 'low' | 'medium' | 'high' | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
      };
      qr_codes: {
        Row: {
          id: string;
          code: string;
          store_id: string | null;
          points: number;
          label: string | null;
          active: boolean;
          max_uses: number | null;
          uses_count: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['qr_codes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['qr_codes']['Insert']>;
      };
      qr_scans: {
        Row: {
          id: string;
          user_id: string;
          qr_code_id: string;
          points_earned: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['qr_scans']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['qr_scans']['Insert']>;
      };
      user_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_claim_date: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_streaks']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_streaks']['Insert']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          public_profile: boolean;
          show_on_leaderboard: boolean;
          share_activity: boolean;
          login_alerts: boolean;
          two_factor_enabled: boolean;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>;
      };
    };
    Functions: {
      perform_action: {
        Args: { p_action: string; p_reference_id?: string | null; p_metadata?: Record<string, unknown> };
        Returns: Record<string, unknown>;
      };
      claim_qr_scan: {
        Args: { p_code: string };
        Returns: Record<string, unknown>;
      };
      create_cashier_qr: {
        Args: {
          p_code: string;
          p_points: number;
          p_amount: number;
          p_expires_at: string;
        };
        Returns: Database['public']['Tables']['qr_codes']['Row'];
      };
      purchase_reward: {
        Args: { p_reward_id: string };
        Returns: Database['public']['Tables']['redemptions']['Row'];
      };
      admin_adjust_points: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_category?: string | null;
          p_reference_id?: string | null;
        };
        Returns: void;
      };
      admin_set_user_role: {
        Args: {
          p_user_id: string;
          p_role: string;
          p_inner_password?: string | null;
        };
        Returns: void;
      };
      super_admin_set_inner_password: {
        Args: {
          p_password: string;
        };
        Returns: void;
      };
      claim_daily_streak: {
        Args: Record<string, never>;
        Returns: Record<string, unknown>;
      };
      get_my_account_status: {
        Args: Record<string, never>;
        Returns: 'active' | 'suspended' | 'deleted';
      };
    };
  };
};
