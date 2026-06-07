// Mock Supabase client for frontend-only mode
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: function() { return this; },
    neq: function() { return this; },
    limit: function() { return this; },
    order: function() { return this; },
    range: function() { return this; },
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  }),
  rpc: () => Promise.resolve({ data: null, error: null }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
};
