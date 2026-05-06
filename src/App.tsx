import React, { useState, useEffect } from 'react';
import Layout from './shared/components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import FalconEye from './features/falcon-eye/FalconEye';
import MROExpert from './features/mro-expert/MROExpert';
import LeanOrbit from './features/lean-orbit/LeanOrbit';
import GlobalIntelligenceView from './features/intelligence/GlobalIntelligenceView';
import CostingView from './features/costing/CostingView';
import ReportChat from './shared/components/ReportChat';
import VirtualTrainer from './features/virtual-trainer/VirtualTrainer';
import SettingsView from './features/settings/SettingsView';
import { VoiceLinkView } from './shared/components/VoiceLinkView';
import { ModuleType } from './types';
import AgusProChat from './shared/components/AgusProChat';

import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { CostsProvider } from './contexts/CostsContext';
import LoginView from './features/auth/LoginView';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [criticalAlert, setCriticalAlert] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isWidgetMode = urlParams.get('widget') === 'true';
  const widgetTenant = urlParams.get('tenant') || 'ia-agus';
  const widgetAgent = urlParams.get('agent') || 'Valentina';
  const shouldOpen = urlParams.get('open') === 'true';

  if (isWidgetMode) {
    return (
      <div className="bg-transparent h-screen w-screen overflow-hidden">
        <AgusProChat 
          tenantId={widgetTenant} 
          agentName={widgetAgent} 
          isWidget={true}
          defaultOpen={shouldOpen}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

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
      case ModuleType.GLOBAL_INTEL:
        return <GlobalIntelligenceView />;
      case ModuleType.COSTING:
        return <CostingView />;
      case ModuleType.AI_ANALYST:
        return (
          <div className="h-[calc(100vh-200px)] max-w-5xl mx-auto py-4">
            <ReportChat analysisContext="Aero IA Pro Main Environment // AS9100 Standard Active" language={language} />
          </div>
        );
      case ModuleType.VIRTUAL_TRAINER:
        return <VirtualTrainer />;
      case ModuleType.SETTINGS:
        return <SettingsView />;
      case ModuleType.VOICE_LINK:
        return <VoiceLinkView />;
      default:
        return <Dashboard onSelectModule={setActiveModule} />;
    }
  };

  return (
    <CostsProvider>
      <Layout
        activeModule={activeModule}
        onNavigate={setActiveModule}
        isCriticalAlert={criticalAlert}
      >
        {renderModule()}
      </Layout>
      <AgusProChat tenantId="ia-agus" agentName="Valentina" />
    </CostsProvider>
  );
};

export default App;
