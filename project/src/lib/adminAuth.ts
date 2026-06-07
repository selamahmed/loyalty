export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  is_active: boolean;
  last_login?: string;
}

export interface AdminSession {
  admin_id: string;
  session_token: string;
  expires_at: string;
}

// Mock admin user for demo
const mockAdmin: AdminUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'super_admin',
  is_active: true,
  last_login: new Date().toISOString(),
};

class AdminAuthService {
  private currentAdmin: AdminUser | null = null;
  private sessionToken: string | null = null;

  async login(email: string, password: string): Promise<AdminSession> {
    // Demo credentials: admin@example.com / password123
    if (email === 'admin@example.com' && password === 'password123') {
      this.currentAdmin = mockAdmin;
      this.sessionToken = 'mock-session-token-' + Date.now();
      localStorage.setItem('admin_session', this.sessionToken);
      return {
        admin_id: mockAdmin.id,
        session_token: this.sessionToken,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      };
    }
    throw new Error('Invalid credentials');
  }

  async logout(): Promise<void> {
    this.currentAdmin = null;
    this.sessionToken = null;
    localStorage.removeItem('admin_session');
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    const token = localStorage.getItem('admin_session');
    if (!token) return null;
    this.currentAdmin = mockAdmin;
    this.sessionToken = token;
    return mockAdmin;
  }

  async changePassword(newPassword: string): Promise<void> {
    console.log('Password changed (mock)');
  }

  isAuthenticated(): boolean {
    return !!this.currentAdmin;
  }

  getCurrentUser(): AdminUser | null {
    return this.currentAdmin;
  }

  hasRole(role: string): boolean {
    if (!this.currentAdmin) return false;
    const roleHierarchy = { super_admin: 3, admin: 2, moderator: 1 };
    return (roleHierarchy[this.currentAdmin.role as keyof typeof roleHierarchy] || 0) >= (roleHierarchy[role as keyof typeof roleHierarchy] || 0);
  }
}

export const adminAuthService = new AdminAuthService();
