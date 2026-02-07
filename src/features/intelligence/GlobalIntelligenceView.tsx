
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
    Globe,
    TrendingUp,
    Zap,
    Lock,
    Briefcase,
    RefreshCw,
    Clock,
    Plane,
    Rocket,
    Shield,
    Database,
    ZapOff
} from 'lucide-react';
import {
    PRODUCTION_VOLUMES,
    STOCK_LEADERS,
    COMMODITIES,
    FUTURE_PROJECTIONS,
    formatLargeNumber,
    getProductionByIndustry,
    getProjectionsByCategory,
    MATERIAL_CONSUMPTION
} from '../../services/globalIntelligenceData';
import { fetchLiveMarketData, clearCache } from '../../services/marketDataAPI';

const GlobalIntelligenceView: React.FC = () => {
    const [selectedIndustry, setSelectedIndustry] = useState<any>('aerospace');
    const [selectedCategory, setSelectedCategory] = useState<string>('Sustainability');
    const [commodities, setCommodities] = useState(COMMODITIES);
    const [stocks, setStocks] = useState(STOCK_LEADERS);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        loadLiveData();
    }, []);

    const loadLiveData = async () => {
        setIsRefreshing(true);
        clearCache();
        try {
            const liveData = await fetchLiveMarketData();

            // Update commodities with live simulation
            const updatedCommodities = COMMODITIES.map(c => {
                const key = c.name.toLowerCase().replace(/ /g, '_').split('(')[0].trim();
                // Match simulation keys
                if (key.includes('titanium')) return { ...c, price: liveData.metals.titanium };
                if (key.includes('carbon')) return { ...c, price: liveData.metals.carbon_fiber };
                if (key.includes('inconel')) return { ...c, price: liveData.metals.inconel };
                if (key.includes('aluminum')) return { ...c, price: liveData.metals.aluminum };
                return c;
            });
            setCommodities(updatedCommodities);

            // Update stocks
            const updatedStocks = STOCK_LEADERS.map(stock => {
                const livePrice = liveData.stocks[stock.symbol];
                if (livePrice) {
                    const oldPrice = stock.price;
                    const change = livePrice - oldPrice;
                    const changePercent = (change / oldPrice) * 100;
                    return {
                        ...stock,
                        price: livePrice,
                        change,
                        changePercent
                    };
                }
                return stock;
            });
            setStocks(updatedStocks);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const industries = [
        { id: 'aerospace', name: 'Commercial', icon: <Plane className="w-4 h-4" /> },
        { id: 'defense', name: 'Defense', icon: <Shield className="w-4 h-4" /> },
        { id: 'space', name: 'Space', icon: <Rocket className="w-4 h-4" /> },
        { id: 'uav', name: 'Unmanned', icon: <Globe className="w-4 h-4" /> },
    ];

    const projectionCategories = ['Sustainability', 'Exploration', 'Mobility', 'Speed'];

    return (
        <div className="h-full p-6 space-y-6 overflow-y-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-tech font-bold text-white tracking-wider flex items-center gap-3">
                        <Globe className="text-cyber-blue w-8 h-8" />
                        AERO <span className="text-cyber-blue">GLOBAL</span> INTELLIGENCE
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Real-time aerospace market indices and strategic forecasts</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Last Intel Sync</p>
                        <p className="text-xs text-cyber-blue font-mono">{lastUpdate.toLocaleTimeString()}</p>
                    </div>
                    <button
                        onClick={loadLiveData}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded-lg 
                                 hover:bg-cyber-blue hover:text-black transition-all flex items-center gap-2 group disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span className="font-tech font-bold uppercase text-xs tracking-widest">
                            {isRefreshing ? 'Syncing...' : 'Sync Live Data'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Top Grid: Market Leaders & Commodities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Market Leaders */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <h3 className="text-lg font-tech font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-400 w-5 h-5" />
                        Tier 1 Market Leaders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stocks.map((stock, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-cyber-blue/30 hover:bg-white/10 transition-all flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-cyber-blue transition-colors">{stock.company}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{stock.symbol} • {stock.industry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-tech font-bold text-white">${stock.price.toFixed(2)}</p>
                                    <div className={`flex items-center justify-end gap-1 text-xs font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aerospace Commodities */}
                <div className="glass-panel rounded-2xl p-6 border-white/5">
                    <h3 className="text-lg font-tech font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-400 w-5 h-5" />
                        Critical Materials
                    </h3>
                    <div className="space-y-4">
                        {commodities.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-400/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-zinc-500">{item.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-tech font-bold text-yellow-400">${item.price.toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold ${item.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {item.change24h >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle Grid: Projections & Production */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Future Projections Chart */}
                <div className="glass-panel rounded-2xl p-6 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-tech font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Rocket className="text-cyber-purple w-5 h-5" />
                            Industry Forecast 2040
                        </h3>
                        <div className="flex gap-2">
                            {projectionCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all
                                             ${selectedCategory === cat
                                            ? 'bg-cyber-purple border-cyber-purple text-white'
                                            : 'border-white/10 text-zinc-500 hover:border-cyber-purple/50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                            data={getProjectionsByCategory(selectedCategory).map(p => ({
                                name: p.item,
                                current: p.current,
                                '2030': p.projected2030,
                                '2040': p.projected2040
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => formatLargeNumber(v)}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#13131f', border: '1px solid #7000ff', borderRadius: '12px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                            <Line type="monotone" dataKey="current" name="Current" stroke="#00f0ff" strokeWidth={3} dot={{ fill: '#00f0ff', r: 4 }} />
                            <Line type="monotone" dataKey="2030" name="2030 Target" stroke="#7000ff" strokeWidth={3} dot={{ fill: '#7000ff', r: 4 }} />
                            <Line type="monotone" dataKey="2040" name="2040 Forecast" stroke="#ff00aa" strokeWidth={3} dot={{ fill: '#ff00aa', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Production Volumes */}
                <div className="glass-panel rounded-2xl p-6 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-tech font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Plane className="text-cyber-blue w-5 h-5" />
                            OEM Production Volumes
                        </h3>
                        <div className="flex gap-2">
                            {industries.map(ind => (
                                <button
                                    key={ind.id}
                                    onClick={() => setSelectedIndustry(ind.id)}
                                    className={`p-2 rounded-lg border transition-all
                                             ${selectedIndustry === ind.id
                                            ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue'
                                            : 'border-white/10 text-zinc-500 hover:border-cyber-blue/50'}`}
                                    title={ind.name}
                                >
                                    {ind.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {getProductionByIndustry(selectedIndustry).map((item, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 text-4xl opacity-10 group-hover:scale-125 transition-transform">
                                    {item.icon}
                                </div>
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{item.product}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-tech font-bold text-white">{formatLargeNumber(item.annualProduction)}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{item.unit}</span>
                                </div>
                                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyber-blue glow-blue" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        ))}
                        {getProductionByIndustry(selectedIndustry).length === 0 && (
                            <div className="col-span-2 py-12 text-center text-zinc-600">
                                <Database className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs uppercase tracking-widest">No detailed logs for this sector</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Resource Efficiency */}
            <div className="glass-panel rounded-2xl p-6 border-white/5 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-tech font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Database className="text-pink-400 w-5 h-5" />
                        Daily Material Flux
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-400/10 border border-pink-400/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Live Monitoring</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MATERIAL_CONSUMPTION.map((item, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-white">{item.material}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase">Consumption / Supply</p>
                                </div>
                                <p className="text-right">
                                    <span className="text-xl font-tech font-bold text-white">{item.dailyAmount}</span>
                                    <span className="text-[10px] text-zinc-500 ml-1">{item.unit}</span>
                                </p>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full animate-progress"
                                    style={{
                                        width: `${(item.dailyAmount / item.capacity) * 100}%`,
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 10px ${item.color}40`
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                                <span>MIN_DEMAND</span>
                                <span>MAX_CAP: {item.capacity} {item.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalIntelligenceView;
