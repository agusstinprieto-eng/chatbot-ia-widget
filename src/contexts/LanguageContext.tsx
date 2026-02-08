import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation } from '../utils/translations';

type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    // Initialize from localStorage or default to 'es'
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('aero-ia-language');
        return (stored === 'es' || stored === 'en') ? stored : 'es';
    });

    // Persist language changes to localStorage
    useEffect(() => {
        localStorage.setItem('aero-ia-language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    // Translation function
    const t = (key: string): string => {
        return getTranslation(key, language);
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook for using language context
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
