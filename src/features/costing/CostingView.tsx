
import React from 'react';
import {
    Calculator,
    Settings,
    TrendingUp,
    DollarSign,
    Clock,
    Zap,
    Users,
    ChevronRight,
    Download,
    FileText,
    PieChart as PieIcon,
    ShieldCheck
} from 'lucide-react';
import { useCosts } from '../../contexts/CostsContext';
import { IndustrialMode } from '../../types';

const CostingView: React.FC = () => {
    const { costInputs, updateCostInput, calculateCosts } = useCosts();
    const results = calculateCosts();

    const processes: { id: IndustrialMode, name: string, icon: React.ReactNode }[] = [
        { id: 'aerospace', name: 'Commercial Assembly', icon: <Clock className="w-4 h-4" /> },
        { id: 'defense', name: 'Precision Defense', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'space', name: 'Space Propulsion', icon: <Zap className="w-4 h-4" /> },
        { id: 'uav', name: 'Composite Layup', icon: <Settings className="w-4 h-4" /> },
        { id: 'propulsion', name: 'Engine MRO', icon: <Settings className="w-4 h-4" /> },
        { id: 'avionics', name: 'Avionics Logic', icon: <Zap className="w-4 h-4" /> },
    ];

    return (
        <div className="h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-tech font-bold text-white tracking-wider flex items-center gap-3">
                        <Calculator className="text-cyber-purple w-8 h-8" />
                        AERO <span className="text-cyber-purple">COSTING</span> CALCULATOR
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Strategic financial modeling for aerospace manufacturing units</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-cyber-blue transition-all group">
                        <FileText className="w-4 h-4 text-cyber-blue" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Export PDF</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-emerald-400 transition-all group">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Excel Link</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Panel */}
                <div className="lg:col-span-5 space-y-6 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <Settings className="w-4 h-4 text-cyber-purple" />
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Operational Parameters</span>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 space-y-8 border-white/5">
                        {/* Process Selector */}
                        <div className="grid grid-cols-2 gap-2">
                            {processes.slice(0, 4).map(proc => (
                                <button
                                    key={proc.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                                              ${costInputs.sam > 300 && proc.id === 'aerospace' ? 'bg-cyber-purple/20 border-cyber-purple text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
                                >
                                    {proc.icon}
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{proc.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* SAM / Cycle Time */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-cyber-purple uppercase tracking-widest">Std. Cycle Time (SAM)</label>
                                <span className="text-xl font-tech font-bold text-white">{costInputs.sam} <small className="text-[10px] text-zinc-500 uppercase">min</small></span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                step="5"
                                value={costInputs.sam}
                                onChange={(e) => updateCostInput('sam', parseFloat(e.target.value))}
                                className="w-full accent-cyber-purple"
                            />
                        </div>

                        {/* Hourly Wage */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tech Hourly Rate</label>
                                <span className="text-xl font-tech font-bold text-white">${costInputs.hourlyWage.toFixed(2)} <small className="text-[10px] text-zinc-500 uppercase">USD</small></span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="150"
                                step="1"
                                value={costInputs.hourlyWage}
                                onChange={(e) => updateCostInput('hourlyWage', parseFloat(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        {/* Efficiency */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-cyber-blue uppercase tracking-widest">Process Efficiency</label>
                                <span className="text-xl font-tech font-bold text-white">{costInputs.efficiency}%</span>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="100"
                                step="1"
                                value={costInputs.efficiency}
                                onChange={(e) => updateCostInput('efficiency', parseFloat(e.target.value))}
                                className="w-full accent-cyber-blue"
                            />
                        </div>

                        {/* Overhead */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Strategic Overhead</label>
                                <span className="text-xl font-tech font-bold text-white">{costInputs.overhead}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="300"
                                step="5"
                                value={costInputs.overhead}
                                onChange={(e) => updateCostInput('overhead', parseFloat(e.target.value))}
                                className="w-full accent-yellow-400"
                            />
                        </div>

                        {/* Production Targets */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Units</label>
                                <input
                                    type="number"
                                    value={costInputs.targetProduction}
                                    onChange={(e) => updateCostInput('targetProduction', parseFloat(e.target.value))}
                                    className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-3 text-white font-tech font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Duty Hours</label>
                                <input
                                    type="number"
                                    value={costInputs.workingHours}
                                    onChange={(e) => updateCostInput('workingHours', parseFloat(e.target.value))}
                                    className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-3 text-white font-tech font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <TrendingUp className="w-4 h-4 text-cyber-blue" />
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Strategic Outcomes</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-panel rounded-2xl p-6 border-white/5 bg-gradient-to-br from-cyber-purple/10 to-transparent flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-black text-cyber-purple uppercase tracking-widest">Minute Cost</p>
                                <DollarSign className="w-4 h-4 text-cyber-purple opacity-40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-3xl font-tech font-bold text-white">${results.minuteCost.toFixed(4)}</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Standard Labor Rate</p>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6 border-white/5 bg-gradient-to-br from-cyber-blue/10 to-transparent flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-black text-cyber-blue uppercase tracking-widest">Final Unit Cost</p>
                                <ChevronRight className="w-4 h-4 text-cyber-blue opacity-40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-3xl font-tech font-bold text-white">${results.pieceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Labor + {costInputs.overhead}% Burden</p>
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="glass-panel rounded-2xl p-8 border-white/5">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest mb-8">
                            <PieIcon className="w-4 h-4 text-cyber-blue" />
                            FOB Value Partition
                        </h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                    <span className="text-zinc-400">Fixed Labor Component</span>
                                    <span className="text-white">${(costInputs.sam * results.minuteCost).toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyber-purple" style={{ width: '40%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                    <span className="text-zinc-400">Certification & Overhead Impact ({costInputs.overhead}%)</span>
                                    <span className="text-yellow-400">${(results.pieceCost - (costInputs.sam * results.minuteCost)).toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Scaling */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel rounded-2xl p-6 border-white/5 text-center bg-white/5 hover:bg-white/10 transition-colors">
                            <Users className="w-6 h-6 mx-auto mb-4 text-cyber-blue opacity-50" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Required Crew</p>
                            <p className="text-3xl font-tech font-bold text-white">{results.requiredOperators}</p>
                            <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">Aerospace Techs</p>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 border-white/5 text-center bg-white/5 hover:bg-white/10 transition-colors">
                            <Zap className="w-6 h-6 mx-auto mb-4 text-emerald-400 opacity-50" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Actual Output</p>
                            <p className="text-3xl font-tech font-bold text-white">{results.actualProduction}</p>
                            <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">Units per Operator/Day</p>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 border-white/5 text-center bg-white/5 hover:bg-white/10 transition-colors">
                            <DollarSign className="w-6 h-6 mx-auto mb-4 text-pink-400 opacity-50" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Daily Payroll</p>
                            <p className="text-xl font-tech font-bold text-white">${results.dailyLabor.toLocaleString()}</p>
                            <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">Projected Spend</p>
                        </div>
                    </div>

                    {/* Market Projection Footnote */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
                        <div className="p-3 bg-cyber-blue/10 rounded-xl">
                            <PieIcon className="w-5 h-5 text-cyber-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Financial Projection (Monthly)</p>
                            <div className="flex gap-8 mt-2">
                                <div>
                                    <p className="text-xs text-zinc-400">OpEx Allocation</p>
                                    <p className="text-lg font-tech font-bold text-white">${(results.dailyLabor * 22).toLocaleString()}</p>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div>
                                    <p className="text-xs text-zinc-400">Gross Value Flux</p>
                                    <p className="text-lg font-tech font-bold text-cyber-blue">${(results.actualProduction * results.requiredOperators * results.pieceCost * 3).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostingView;
