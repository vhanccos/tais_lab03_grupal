import React from 'react';
import { Backpack, Package, Users, Wrench, Waves } from 'lucide-react';

export type TabType = 'mochila' | 'caja' | 'plan' | 'sos' | 'huaicos';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  badgeMochila?: number;
  badgeCaja?: number;
  badgePlan?: number;
  badgeHuaicos?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  badgeMochila,
  badgeCaja,
  badgePlan,
  badgeHuaicos
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[60px] z-40 shadow-xs">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex overflow-x-auto no-scrollbar">
        <button
          onClick={() => onTabChange('mochila')}
          className={`flex-1 py-3 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap min-h-[48px] ${
            activeTab === 'mochila'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-mochila"
        >
          <Backpack className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Mochila 24-48h</span>
          {typeof badgeMochila === 'number' && (
            <span className="text-[10px] sm:text-xs bg-slate-100 px-1.5 py-0.5 rounded-full font-bold">
              {badgeMochila}%
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('caja')}
          className={`flex-1 py-3 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap min-h-[48px] ${
            activeTab === 'caja'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-caja"
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-amber-600" />
          <span>Caja 72h+</span>
          {typeof badgeCaja === 'number' && (
            <span className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
              {badgeCaja}%
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('plan')}
          className={`flex-1 py-3 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap min-h-[48px] ${
            activeTab === 'plan'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-plan"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Plan & 119</span>
          {typeof badgePlan === 'number' && badgePlan > 0 && (
            <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
              {badgePlan}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('sos')}
          className={`flex-1 py-3 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap min-h-[48px] ${
            activeTab === 'sos'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-sos"
        >
          <Wrench className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-blue-600" />
          <span>Herramientas SOS</span>
        </button>

        <button
          onClick={() => onTabChange('huaicos')}
          className={`flex-1 py-3 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap min-h-[48px] ${
            activeTab === 'huaicos'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-huaicos"
        >
          <Waves className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-600" />
          <span>Huaicos</span>
          {typeof badgeHuaicos === 'number' && (
            <span className="text-[10px] sm:text-xs bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full font-bold">
              {badgeHuaicos}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
