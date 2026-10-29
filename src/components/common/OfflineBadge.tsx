import React from 'react';
import { WifiOff, HardDrive } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
          <span>Funcionamiento 100% Local y Autónomo</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Datos guardados en tu dispositivo</span>
        </div>
      </div>
    </div>
  );
};
