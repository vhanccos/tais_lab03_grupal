import { useState } from 'react';
import { Header } from './components/common/Header';
import { NavigationTabs, TabType } from './components/common/NavigationTabs';
import { OfflineBadge } from './components/common/OfflineBadge';
import { ChecklistMochila } from './components/mochila/ChecklistMochila';
import { PlanFamiliarView } from './components/planFamiliar/PlanFamiliarView';
import { useMochila } from './hooks/useMochila';
import { usePlanFamiliar } from './hooks/usePlanFamiliar';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('mochila');
  const { progress } = useMochila();
  const { plan } = usePlanFamiliar();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white">
      <Header progresoTotal={progress.porcentajeTotal} />
      <OfflineBadge />
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeMochila={progress.porcentajeTotal}
        badgePlan={plan.integrantes.length}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'mochila' ? (
          <ChecklistMochila />
        ) : (
          <PlanFamiliarView />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p className="max-w-md mx-auto px-4">
          SismoListo © {new Date().getFullYear()} — Diseñado bajo lineamientos oficiales de INDECI para operar 100% sin internet ante emergencias sísmicas.
        </p>
      </footer>
    </div>
  );
}

export default App;
