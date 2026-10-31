import React from 'react';
import { Backpack, Users, Waves } from 'lucide-react';

export type TabType = 'mochila' | 'plan' | 'huaicos';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  badgeMochila?: number;
  badgePlan?: number;
  badgeHuaicos?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  badgeMochila,
  badgePlan,
  badgeHuaicos
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[60px] z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex overflow-x-auto">
        <button
          onClick={() => onTabChange('mochila')}
          className={`flex-1 py-3 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'mochila'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-mochila"
        >
          <Backpack className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Mochila de Emergencia</span>
          {typeof badgeMochila === 'number' && (
            <span className="text-[10px] sm:text-xs bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
              {badgeMochila}%
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('plan')}
          className={`flex-1 py-3 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'plan'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-plan"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Plan Familiar & 119</span>
          {typeof badgePlan === 'number' && badgePlan > 0 && (
            <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
              {badgePlan}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('huaicos')}
          className={`flex-1 py-3 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'huaicos'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-huaicos"
        >
          <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
          <span>Huaicos</span>
          {typeof badgeHuaicos === 'number' && (
            <span className="text-[10px] sm:text-xs bg-sky-100 text-sky-800 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
              {badgeHuaicos}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
