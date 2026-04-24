import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      // Use backend function to bypass RLS — members can see the owner's account
      const res = await base44.functions.invoke('getMyAccount', {});
      setAccount(res.data?.account || null);
    } catch (e) {
      console.error('AccountContext error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const isOwner = account?.owner_email === user?.email;

  return (
    <AccountContext.Provider value={{ account, setAccount, user, isOwner, isLoading, reload }}>
      {children}
    </AccountContext.Provider>
  );
}

export function AccountGuard({ children }) {
  const { account, isLoading } = useContext(AccountContext);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!account) {
    // lazy import to avoid circular deps
    const AccountSetup = React.lazy(() => import('../components/shared/AccountSetup'));
    return (
      <React.Suspense fallback={null}>
        <AccountSetup />
      </React.Suspense>
    );
  }

  return children;
}

export const useAccount = () => useContext(AccountContext);