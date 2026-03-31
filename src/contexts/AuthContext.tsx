
/**
 * 🔒 SECURE AUTH CONTEXT - Aero IA Pro
 *
 * Implements secure authentication without hardcoded credentials.
 * Uses Supabase Auth with database-backed roles.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'engineer' | 'manager' | 'operator' | 'user';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  company?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting config
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

let loginAttempts: { timestamp: number; email: string }[] = [];

function checkRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  loginAttempts = loginAttempts.filter(a => now - a.timestamp < RATE_LIMIT.windowMs);

  const emailAttempts = loginAttempts.filter(a => a.email === email).length;
  if (emailAttempts >= RATE_LIMIT.maxAttempts) {
    const oldest = loginAttempts.find(a => a.email === email);
    if (oldest) {
      const retryAfter = Math.ceil((RATE_LIMIT.windowMs - (now - oldest.timestamp)) / 1000);
      return { allowed: false, retryAfter };
    }
  }
  return { allowed: true };
}

function recordLoginAttempt(email: string) {
  loginAttempts.push({ timestamp: Date.now(), email });
}

function clearLoginAttempts(email: string) {
  loginAttempts = loginAttempts.filter(a => a.email !== email);
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).then(setProfile);
      }

      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: any | null }> => {
    try {
      const rateLimit = checkRateLimit(email);
      if (!rateLimit.allowed) {
        return {
          error: {
            message: `Demasiados intentos. Intenta en ${Math.ceil(rateLimit.retryAfter! / 60)} min.`,
          },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        recordLoginAttempt(email);
        return { error };
      }

      clearLoginAttempts(email);

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isLoading,
      isAdmin,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
