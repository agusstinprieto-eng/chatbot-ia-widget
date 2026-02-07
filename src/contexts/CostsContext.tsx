
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CostInputs } from '../types';

interface CostsContextType {
    costInputs: CostInputs;
    updateCostInput: (field: keyof CostInputs, value: number) => void;
    setCostInputs: (inputs: CostInputs) => void;
    calculateCosts: () => {
        minuteCost: number;
        pieceCost: number;
        requiredOperators: number;
        actualProduction: number;
        dailyLabor: number;
    };
}

const DEFAULT_INPUTS: CostInputs = {
    sam: 120, // Standard Allowed Minutes for aerospace is usually higher
    hourlyWage: 25, // Higher for technicians
    efficiency: 85,
    overhead: 150, // Aero compliance overhead is high
    targetProduction: 10,
    workingHours: 8
};

const CostsContext = createContext<CostsContextType | undefined>(undefined);

export const CostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [costInputs, setCostInputs] = useState<CostInputs>(DEFAULT_INPUTS);

    const updateCostInput = (field: keyof CostInputs, value: number) => {
        setCostInputs(prev => ({ ...prev, [field]: value }));
    };

    const calculateCosts = () => {
        const { sam, hourlyWage, efficiency, overhead, targetProduction, workingHours } = costInputs;

        // Cost per minute (labor)
        const minuteCost = (hourlyWage / 60) / (efficiency / 100);

        // Labor cost for one piece
        const laborCostPerPiece = sam * minuteCost;

        // Piece cost including overhead
        const pieceCost = laborCostPerPiece * (1 + overhead / 100);

        // Daily production per operator
        const dailyMinutes = workingHours * 60;
        const availableMinutes = dailyMinutes * (efficiency / 100);
        const actualProductionPerOp = Math.floor(availableMinutes / sam);

        // Required staff to meet target
        const requiredOperators = Math.ceil(targetProduction / (actualProductionPerOp || 1));

        // Total daily labor cost
        const dailyLabor = requiredOperators * hourlyWage * workingHours;

        return {
            minuteCost,
            pieceCost,
            requiredOperators,
            actualProduction: actualProductionPerOp,
            dailyLabor
        };
    };

    return (
        <CostsContext.Provider value={{ costInputs, updateCostInput, setCostInputs, calculateCosts }}>
            {children}
        </CostsContext.Provider>
    );
};

export const useCosts = () => {
    const context = useContext(CostsContext);
    if (!context) throw new Error('useCosts must be used within CostsProvider');
    return context;
};
