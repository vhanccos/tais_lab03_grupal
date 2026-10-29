import React from 'react';
import { Backpack, Users } from 'lucide-react';

export type TabType = 'mochila' | 'plan';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  badgeMochila?: number;
  badgePlan?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  badgeMochila,
  badgePlan
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[60px] z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex">
        <button
          onClick={() => onTabChange('mochila')}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm border-b-2 flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'mochila'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-mochila"
        >
          <Backpack className="w-5 h-5" />
          <span>Mochila de Emergencia</span>
          {typeof badgeMochila === 'number' && (
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold">
              {badgeMochila}%
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('plan')}
          className={`flex-1 py-3 px-4 text-center font-semibold text-sm border-b-2 flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'plan'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-plan"
        >
          <Users className="w-5 h-5" />
          <span>Plan Familiar & 119</span>
          {typeof badgePlan === 'number' && badgePlan > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              {badgePlan}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
