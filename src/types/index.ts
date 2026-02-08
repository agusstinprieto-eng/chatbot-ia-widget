
export enum ModuleType {
    DASHBOARD = 'DASHBOARD',
    FALCON_EYE = 'FALCON_EYE',
    MRO_EXPERT = 'MRO_EXPERT',
    LEAN_ORBIT = 'LEAN_ORBIT',
    GLOBAL_INTEL = 'GLOBAL_INTEL',
    COSTING = 'COSTING',
    AI_ANALYST = 'AI_ANALYST',
    VIRTUAL_TRAINER = 'VIRTUAL_TRAINER',
    SETTINGS = 'SETTINGS',
}

export interface InspectionData {
    defectType: string;
    description: string;
    isCritical: boolean;
    complianceRef?: string;
}

export interface NCRReport {
    id: string;
    date: string;
    defect: string;
    standard: string;
    recommendation: string;
    status: 'PENDING' | 'CRITICAL' | 'RESOLVED';
}

export interface MROQuery {
    question: string;
    answer: string;
    reference: string;
    tooling: string;
}

export interface LeanMetric {
    name: string;
    value: number;
    unit: string;
    threshold: number;
}

export type TabType = 'dashboard' | 'falcon' | 'mro' | 'lean' | 'intel' | 'costing';

export type IndustrialMode = 'aerospace' | 'defense' | 'space' | 'uav' | 'propulsion' | 'avionics';

export interface CostInputs {
    sam: number;
    hourlyWage: number;
    efficiency: number;
    overhead: number;
    targetProduction: number;
    workingHours: number;
}
