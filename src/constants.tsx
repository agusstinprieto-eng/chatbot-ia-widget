
import React from 'react';
import { ShieldCheck, BrainCircuit, Activity, LayoutDashboard, AlertTriangle, PenTool as Tool, Search, Settings } from 'lucide-react';

export const COLORS = {
  PRIMARY: 'teal-500',
  CRITICAL: 'red-600',
  BG: 'slate-900',
  CARD: 'slate-800/50',
  BORDER: 'slate-700',
  TEXT: 'slate-200',
};

export const MODULES_INFO = [
  {
    id: 'FALCON_EYE',
    title: 'Falcon Eye',
    subtitle: 'Quality & Compliance',
    description: 'Real-time visual inspection and AS9100 Rev D NCR generation.',
    icon: <ShieldCheck className="w-8 h-8 text-teal-500" />,
  },
  {
    id: 'MRO_EXPERT',
    title: 'MRO Expert',
    subtitle: 'Technical Intelligence',
    description: 'Direct access to technical manuals with precision specifications.',
    icon: <BrainCircuit className="w-8 h-8 text-teal-500" />,
  },
  {
    id: 'LEAN_ORBIT',
    title: 'Lean Orbit',
    subtitle: 'Process Optimization',
    description: 'Takt time tracking, bottleneck identification, and line balancing.',
    icon: <Activity className="w-8 h-8 text-teal-500" />,
  },
];
