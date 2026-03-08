// Translation dictionary for Aero IA Pro
// Structure: { key: { es: 'Spanish text', en: 'English text' } }

interface Translations {
    [key: string]: {
        es: string;
        en: string;
    };
}

export const translations: Translations = {
    // Navigation
    'nav.dashboard': { es: 'Dashboard', en: 'Dashboard' },
    'nav.falcon_eye': { es: 'Falcon Eye', en: 'Falcon Eye' },
    'nav.mro_expert': { es: 'MRO Expert', en: 'MRO Expert' },
    'nav.lean_orbit': { es: 'Lean Orbit', en: 'Lean Orbit' },
    'nav.global_intel': { es: 'Global Intel', en: 'Global Intel' },
    'nav.costing': { es: 'Costing', en: 'Costing' },
    'nav.aero_analyst': { es: 'Aero Analyst', en: 'Aero Analyst' },
    'nav.virtual_trainer': { es: 'Virtual Trainer', en: 'Virtual Trainer' },
    'nav.settings': { es: 'Configuración', en: 'Settings' },
    'nav.voice_link': { es: 'Enlace de Voz', en: 'Voice Link' },
    'nav.operator_exit': { es: 'Operator Exit', en: 'Operator Exit' },

    // Header
    'header.system_status': { es: 'System Status', en: 'System Status' },
    'header.compliance': { es: 'Nominal // Compliance 100%', en: 'Nominal // Compliance 100%' },

    // Footer
    'footer.live_integration': { es: 'Live Integration Active', en: 'Live Integration Active' },

    // Virtual Trainer
    'vt.welcome': {
        es: 'Bienvenido al Módulo de Entrenamiento Virtual de Aero IA. Soy tu Instructor IA. Selecciona un tema de entrenamiento para comenzar tu proceso de certificación.',
        en: 'Welcome to the Aero IA Virtual Training Module. I am your AI Instructor. Select a training topic to begin your certification process.'
    },
    'vt.ready_to_train': { es: '¿Listo para Entrenar?', en: 'Ready to Train?' },
    'vt.select_module': {
        es: 'Selecciona un módulo de entrenamiento de la barra lateral para inicializar el protocolo del Instructor IA.',
        en: 'Select a training module from the sidebar to initialize the AI Instructor protocol.'
    },
    'vt.certification_readiness': { es: 'Preparación para Certificación', en: 'Certification Readiness' },
    'vt.training_modules': { es: 'Módulos de Entrenamiento', en: 'Training Modules' },
    'vt.proficiency_level': { es: 'Nivel de Competencia', en: 'Proficiency Level' },
    'vt.beginner': { es: 'Principiante', en: 'Beginner' },
    'vt.intermediate': { es: 'Intermedio', en: 'Intermediate' },
    'vt.expert': { es: 'Experto', en: 'Expert' },
    'vt.type_response': { es: 'Escribe tu respuesta o haz una pregunta...', en: 'Type your response or ask a question...' },

    // Common
    'common.loading': { es: 'Cargando...', en: 'Loading...' },
    'common.error': { es: 'Error', en: 'Error' },
    'common.send': { es: 'Enviar', en: 'Send' },
    'common.cancel': { es: 'Cancelar', en: 'Cancel' },
    'common.save': { es: 'Guardar', en: 'Save' },
};

// Helper function to get translation
export const getTranslation = (key: string, lang: 'es' | 'en'): string => {
    const translation = translations[key];
    if (!translation) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }
    return translation[lang];
};
