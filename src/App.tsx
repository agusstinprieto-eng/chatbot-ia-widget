
import React, { useState, useEffect } from 'react';
import Layout from './shared/components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import FalconEye from './features/falcon-eye/FalconEye';
import MROExpert from './features/mro-expert/MROExpert';
import LeanOrbit from './features/lean-orbit/LeanOrbit';
import { ModuleType } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [criticalAlert, setCriticalAlert] = useState(false);

  // Demonstrate MRO Expert first if requested by user startup instruction
  // (In a real app, this might be triggered by a specific URL hash or initial state)
  useEffect(() => {
    // Optionally set MRO as default demo if needed:
    // setActiveModule(ModuleType.MRO_EXPERT);
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.DASHBOARD:
        return <Dashboard onSelectModule={setActiveModule} />;
      case ModuleType.FALCON_EYE:
        return <FalconEye setCriticalAlert={setCriticalAlert} />;
      case ModuleType.MRO_EXPERT:
        return <MROExpert />;
      case ModuleType.LEAN_ORBIT:
        return <LeanOrbit />;
      default:
        return <Dashboard onSelectModule={setActiveModule} />;
    }
  };

  return (
    <Layout
      activeModule={activeModule}
      onNavigate={setActiveModule}
      isCriticalAlert={criticalAlert}
    >
      {renderModule()}
    </Layout>
  );
};

export default App;
