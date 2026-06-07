import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-2xl border-2 border-black mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Admin Console</h1>
          <p className="text-gray-400">Enterprise Control Panel</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-black dark:border-gray-700 p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div className="flex items-center gap-2 p-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <Mail size={18} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="flex items-center gap-2 p-3 rounded-2xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <Lock size={18} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 px-4 rounded-2xl border-2 border-black dark:border-gray-600 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-black text-lg hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Credentials */}
          <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              admin@example.com / password123
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Secure admin panel. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
