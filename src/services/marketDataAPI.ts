
import { COMMODITIES, STOCK_LEADERS } from './globalIntelligenceData';

const CACHE_DURATION_MS = 10 * 1000;

interface CachedData<T> {
    data: T;
    timestamp: number;
}

function getCached<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        const cached: CachedData<T> = JSON.parse(item);
        if (Date.now() - cached.timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return cached.data;
    } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) { console.error('Cache error:', e); }
}

const generateRandomWalk = (currentPrice: number, volatility: number = 0.01): number => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const change = volatility * z;
    return Number((currentPrice * (1 + change)).toFixed(2));
};

export async function fetchLiveMarketData() {
    console.log('Generating simulated live aerospace market data...');
    await new Promise(resolve => setTimeout(resolve, 800));

    const metals = {
        titanium: generateRandomWalk(28.50, 0.005),
        carbon_fiber: generateRandomWalk(45.00, 0.008),
        inconel: generateRandomWalk(32.20, 0.006),
        aluminum: generateRandomWalk(5.80, 0.004),
    };

    const stocks: Record<string, number> = {};
    STOCK_LEADERS.forEach(s => {
        stocks[s.symbol] = generateRandomWalk(s.price, 0.012);
    });

    return {
        metals,
        stocks,
        timestamp: new Date().toISOString(),
    };
}

export function clearCache(): void {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('aero_market_')) {
            localStorage.removeItem(key);
        }
    });
}
