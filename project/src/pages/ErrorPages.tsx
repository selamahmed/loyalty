import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Wifi, Wrench } from 'lucide-react';
import { tr } from '../lib/tr';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-black text-gray-200 dark:text-gray-700 mb-4 select-none">404</div>
        <div className="text-6xl mb-6 animate-float">🔍</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center justify-center gap-2">
            <RefreshCw size={16} /> Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-primary flex items-center justify-center gap-2">
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export const NoConnection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
          <Wifi size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No Connection</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()} className="btn-primary flex items-center justify-center gap-2 mx-auto">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
};

export const Maintenance: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="text-center max-w-sm">
      <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
        <Wrench size={40} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Under Maintenance</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">We're working hard to improve your experience. Check back soon!</p>
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Estimated back online: 2 hours</p>
      </div>
    </div>
  </div>
);
