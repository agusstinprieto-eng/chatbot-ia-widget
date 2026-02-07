
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'engineer' | 'manager' | 'operator';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    company: string;
    analysisLimit?: number;
    supportMinutes?: number;
    isUnlimited?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    analysisCount: number;
    remainingAnalyses: number;
    incrementAnalysis: () => boolean;
    isDemoExpired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static credentials for Aero IA Pro
const DEMO_USERS: Record<string, { password: string; user: User }> = {
    'aero': {
        password: 'demo',
        user: {
            id: 'aero-demo-id',
            email: 'aero',
            name: 'Aero Demo User',
            role: 'manager',
            company: 'Aero Aerospace Cluster',
            analysisLimit: 10,
            supportMinutes: 15
        }
    },
    'agus': {
        password: 'godmode',
        user: {
            id: 'agus-god-id',
            email: 'agus',
            name: 'Agustín Prieto',
            role: 'admin',
            company: 'IA.AGUS',
            isUnlimited: true
        }
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [analysisCount, setAnalysisCount] = useState(0);
    const [demoStartTime, setDemoStartTime] = useState<number | null>(null);

    const MAX_ANALYSES = user?.analysisLimit || 5;
    const DEMO_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    useEffect(() => {
        const storedUser = localStorage.getItem('aero-ia-user');
        const storedCount = localStorage.getItem('aero-ia-analysis-count');
        const storedStart = localStorage.getItem('aero-ia-demo-start');

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('aero-ia-user');
            }
        }

        if (storedCount) setAnalysisCount(parseInt(storedCount, 10));
        if (storedStart) setDemoStartTime(parseInt(storedStart, 10));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const newUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email || 'User',
                    role: session.user.user_metadata?.role as UserRole || 'manager',
                    company: session.user.user_metadata?.company || 'Organization',
                    analysisLimit: session.user.user_metadata?.analysisLimit,
                    supportMinutes: session.user.user_metadata?.supportMinutes
                };
                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem('aero-ia-user', JSON.stringify(newUser));
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('aero-ia-user');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const normalizedEmail = email.toLowerCase().trim();
        const demoUser = DEMO_USERS[normalizedEmail];

        if (demoUser && demoUser.password === password) {
            await new Promise(r => setTimeout(r, 600)); // Sim delay
            setUser(demoUser.user);
            setIsAuthenticated(true);
            localStorage.setItem('aero-ia-user', JSON.stringify(demoUser.user));

            if (!localStorage.getItem('aero-ia-demo-start')) {
                const now = Date.now();
                setDemoStartTime(now);
                localStorage.setItem('aero-ia-demo-start', now.toString());
            }
            return true;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return false;
            return !!data.user;
        } catch (e) {
            return false;
        }
    };

    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('aero-ia-user');
        await supabase.auth.signOut();
    };

    const incrementAnalysis = (): boolean => {
        if (user?.isUnlimited) return true;
        if (isDemoExpired) return false;
        if (analysisCount >= MAX_ANALYSES) return false;

        const nextCount = analysisCount + 1;
        setAnalysisCount(nextCount);
        localStorage.setItem('aero-ia-analysis-count', nextCount.toString());
        return true;
    };

    const isDemoExpired = !!(demoStartTime && (Date.now() - demoStartTime > DEMO_DURATION_MS));

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            analysisCount,
            remainingAnalyses: Math.max(0, MAX_ANALYSES - analysisCount),
            incrementAnalysis,
            isDemoExpired
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
