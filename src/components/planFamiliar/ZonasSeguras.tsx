import React, { useState } from 'react';
import { MapPin, Home, Check } from 'lucide-react';

interface ZonasSegurasProps {
  puntoInterno: string;
  puntoExterno: string;
  onSave: (interno: string, externo: string) => void;
}

export const ZonasSeguras: React.FC<ZonasSegurasProps> = ({
  puntoInterno,
  puntoExterno,
  onSave
}) => {
  const [interno, setInterno] = useState(puntoInterno);
  const [externo, setExterno] = useState(puntoExterno);
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(interno.trim(), externo.trim());
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-1">
        <MapPin className="w-5 h-5 text-red-600" />
        <span>Puntos de Encuentro Seguro</span>
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Define dónde reunirse dentro de la vivienda durante el sismo y fuera del inmueble tras la evacuación.
      </p>

      <form onSubmit={handleGuardar} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Punto de Encuentro Interno (Zona Segura en Casa)</span>
          </label>
          <input
            type="text"
            value={interno}
            onChange={(e) => setInterno(e.target.value)}
            placeholder="Ej. Columna estructural en el pasadizo central"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            maxLength={120}
            data-testid="input-punto-interno"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Punto de Encuentro Externo (Punto de Reunión Comunitario)</span>
          </label>
          <input
            type="text"
            value={externo}
            onChange={(e) => setExterno(e.target.value)}
            placeholder="Ej. Parque central del vecindario, zona sin cables ni postes"
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            maxLength={120}
            data-testid="input-punto-externo"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
          data-testid="btn-guardar-zonas"
        >
          {guardado ? <Check className="w-4 h-4 text-emerald-400" /> : <MapPin className="w-4 h-4" />}
          <span>{guardado ? 'Zonas Guardadas' : 'Guardar Zonas Seguras'}</span>
        </button>
      </form>
    </div>
  );
};
