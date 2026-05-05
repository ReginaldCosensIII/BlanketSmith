import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isRecoveryEvent: boolean;
  clearRecoveryEvent: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoveryEvent, setIsRecoveryEvent] = useState(false);

  useEffect(() => {
    // Hydrate from any persisted session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Subscribe to live auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Once we've received the first auth event, loading is definitely done
      setIsLoading(false);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryEvent(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearRecoveryEvent = () => setIsRecoveryEvent(false);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isRecoveryEvent, clearRecoveryEvent }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth — consume the global authentication state.
 * Must be used inside an <AuthProvider> ancestor.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
