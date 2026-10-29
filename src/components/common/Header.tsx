import React from 'react';
import { ShieldAlert, WifiOff } from 'lucide-react';

interface HeaderProps {
  progresoTotal?: number;
}

export const Header: React.FC<HeaderProps> = ({ progresoTotal = 0 }) => {
  return (
    <header className="bg-red-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-700 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SismoListo</h1>
            <p className="text-xs text-red-100 flex items-center gap-1 font-medium">
              <WifiOff className="w-3.5 h-3.5 inline" /> Modo 100% Offline
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase font-semibold text-red-200 block">Preparación</span>
          <span className="text-lg font-extrabold" data-testid="header-progress-text">
            {progresoTotal}%
          </span>
        </div>
      </div>
    </header>
  );
};
