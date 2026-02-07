
// Aerospace Intelligence Data Service
// Provides curated aerospace manufacturing, market, and economic data

export interface ProductionData {
    industry: 'aerospace' | 'defense' | 'space' | 'uav' | 'propulsion' | 'avionics';
    product: string;
    annualProduction: number;
    unit: string;
    year: number;
    icon: string;
}

export interface StockData {
    symbol: string;
    company: string;
    industry: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: string;
}

export interface CommodityData {
    name: string;
    price: number;
    unit: string;
    change24h: number;
    changePercent: number;
    icon: string;
}

export interface FutureProjection {
    category: string;
    item: string;
    current: number;
    projected2030: number;
    projected2040: number;
    unit: string;
    icon: string;
}

export interface MaterialConsumptionData {
    material: string;
    dailyAmount: number;
    unit: string;
    capacity: number;
    color: string;
}

// Global Aerospace Production Volumes (2024 Estimates)
export const PRODUCTION_VOLUMES: ProductionData[] = [
    { industry: 'aerospace', product: 'Narrow-body Aircraft', annualProduction: 1250, unit: 'units/year', year: 2024, icon: '✈️' },
    { industry: 'aerospace', product: 'Wide-body Aircraft', annualProduction: 420, unit: 'units/year', year: 2024, icon: '🛫' },
    { industry: 'defense', product: 'F-35 Lightning II', annualProduction: 156, unit: 'units/year', year: 2024, icon: '🛡️' },
    { industry: 'space', product: 'Starlink Satellites', annualProduction: 2500, unit: 'units/year', year: 2024, icon: '📡' },
    { industry: 'uav', product: 'Tactical Drones', annualProduction: 8500, unit: 'units/year', year: 2024, icon: '🛸' },
    { industry: 'propulsion', product: 'LEAP Engines', annualProduction: 2100, unit: 'units/year', year: 2024, icon: '🔥' },
];

// Aerospace Stock Market Leaders
export const STOCK_LEADERS: StockData[] = [
    { symbol: 'BA', company: 'Boeing', industry: 'Commercial', price: 178.50, change: -1.20, changePercent: -0.67, marketCap: '$109B' },
    { symbol: 'AIR.PA', company: 'Airbus', industry: 'Commercial', price: 145.30, change: 2.10, changePercent: 1.46, marketCap: '€115B' },
    { symbol: 'LMT', company: 'Lockheed Martin', industry: 'Defense', price: 488.20, change: 5.40, changePercent: 1.12, marketCap: '$122B' },
    { symbol: 'NOC', company: 'Northrop Grumman', industry: 'Defense', price: 462.15, change: 3.20, changePercent: 0.70, marketCap: '$69B' },
    { symbol: 'ERJ', company: 'Embraer', industry: 'Commercial', price: 29.40, change: 0.85, changePercent: 2.98, marketCap: '$5.4B' },
    { symbol: 'RTX', company: 'RTX Corp', industry: 'Aerospace/Defense', price: 92.10, change: -0.45, changePercent: -0.49, marketCap: '$126B' },
];

// Aerospace Key Materials & Commodities
export const COMMODITIES: CommodityData[] = [
    { name: 'Titanium Ti-6Al-4V', price: 28.50, unit: 'USD/kg', change24h: 0.45, changePercent: 1.60, icon: '⛏️' },
    { name: 'Carbon Fiber (T800)', price: 45.00, unit: 'USD/kg', change24h: -1.20, changePercent: -2.60, icon: '🕸️' },
    { name: 'Inconel 718', price: 32.20, unit: 'USD/kg', change24h: 0.15, changePercent: 0.47, icon: '💎' },
    { name: 'Aero Aluminum 7075', price: 5.80, unit: 'USD/kg', change24h: 0.05, changePercent: 0.87, icon: '⚙️' },
    { name: 'Aviation Fuel (Jet A)', price: 2.85, unit: 'USD/gal', change24h: -0.12, changePercent: -4.04, icon: '⛽' },
];

// Future Aerospace Projections
export const FUTURE_PROJECTIONS: FutureProjection[] = [
    { category: 'Sustainability', item: 'Electric Aircraft Count', current: 15, projected2030: 450, projected2040: 2800, unit: 'active fleet', icon: '🔋' },
    { category: 'Exploration', item: 'Commercial Space Travel', current: 0.04, projected2030: 1.2, projected2040: 8.5, unit: '$B Revenue', icon: '🚀' },
    { category: 'Mobility', item: 'eVTOL Operations', current: 5, projected2030: 1200, projected2040: 15000, unit: 'daily flights', icon: '🚁' },
    { category: 'Speed', item: 'Hypersonic Corridors', current: 0, projected2030: 2, projected2040: 12, unit: 'Global routes', icon: '☄️' },
];

// Daily Aerospace Material Consumption (Est.)
export const MATERIAL_CONSUMPTION: MaterialConsumptionData[] = [
    { material: 'Titanium', dailyAmount: 420, unit: 'tons', capacity: 500, color: '#60a5fa' },
    { material: 'Carbon Fiber', dailyAmount: 180, unit: 'tons', capacity: 250, color: '#9ca3af' },
    { material: 'Al-Li Alloys', dailyAmount: 650, unit: 'tons', capacity: 800, color: '#c084fc' },
];

export const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
};

export const getProductionByIndustry = (industry: ProductionData['industry']): ProductionData[] => {
    return PRODUCTION_VOLUMES.filter(p => p.industry === industry);
};

export const getStocksByIndustry = (industry: string): StockData[] => {
    return STOCK_LEADERS.filter(s => s.industry === industry);
};

export const getProjectionsByCategory = (category: string): FutureProjection[] => {
    return FUTURE_PROJECTIONS.filter(p => p.category === category);
};
