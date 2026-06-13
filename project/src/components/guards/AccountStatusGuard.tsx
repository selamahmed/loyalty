import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AccountRestricted from '../../pages/AccountRestricted';
import { useAuth } from '../../context/AuthContext';
import { fetchMyAccountStatus, isRestrictedStatus, type AccountStatus } from '../../services/accountStatus';

const AccountStatusGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isLoading, role, authUser, logout } = useAuth();
  const { pathname } = useLocation();
  const [verifiedStatus, setVerifiedStatus] = useState<AccountStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const lastVerifiedUser = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !authUser?.id || role !== 'customer') {
      lastVerifiedUser.current = null;
      setVerifiedStatus(null);
      setChecking(false);
      return;
    }

    if (lastVerifiedUser.current === authUser.id) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    void fetchMyAccountStatus(authUser.id).then(status => {
      if (cancelled) return;
      lastVerifiedUser.current = authUser.id;
      setVerifiedStatus(status);
      setChecking(false);
      if (status === 'deleted') void logout();
    });

    return () => { cancelled = true; };
  }, [isLoading, authUser?.id, role, logout]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !authUser?.id || role !== 'customer') return;
      void fetchMyAccountStatus(authUser.id).then(status => {
        setVerifiedStatus(status);
        if (status === 'deleted') void logout();
      });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [authUser?.id, role, logout]);

  if (isLoading || checking) return null;

  const status = verifiedStatus ?? (profile?.status as AccountStatus | null);
  const onSupport = pathname.startsWith('/support');

  if (role === 'customer' && isRestrictedStatus(status)) {
    if (status === 'deleted') return null;
    if (onSupport) return <>{children}</>;
    return <AccountRestricted status={status} />;
  }

  return <>{children}</>;
};

export default AccountStatusGuard;
