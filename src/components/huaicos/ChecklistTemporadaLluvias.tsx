import React, { useState } from 'react';
import {
  ItemHuaicoChecklist,
  MetricaProgresoHuaico,
  CategoriaHuaicoId,
  CATEGORIAS_HUAICOS
} from '../../core/huaicosDomain';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  FileText,
  PackageCheck,
  Mountain
} from 'lucide-react';

interface ChecklistTemporadaLluviasProps {
  articulos: ItemHuaicoChecklist[];
  metricas: MetricaProgresoHuaico;
  onToggleItem: (id: string) => void;
  onReset: () => void;
}

export const ChecklistTemporadaLluvias: React.FC<ChecklistTemporadaLluviasProps> = ({
  articulos,
  metricas,
  onToggleItem,
  onReset
}) => {
  const [abiertas, setAbiertas] = useState<Record<CategoriaHuaicoId, boolean>>({
    proteccion_hogar: true,
    documentos_impermeables: true,
    suministros_reserva: true,
    evacuacion_comunitaria: true
  });

  const toggleCategoria = (id: CategoriaHuaicoId) => {
    setAbiertas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoriaIcon = (id: CategoriaHuaicoId) => {
    switch (id) {
      case 'proteccion_hogar':
        return <ShieldCheck className="w-5 h-5 text-sky-600" />;
      case 'documentos_impermeables':
        return <FileText className="w-5 h-5 text-amber-600" />;
      case 'suministros_reserva':
        return <PackageCheck className="w-5 h-5 text-emerald-600" />;
      case 'evacuacion_comunitaria':
        return <Mountain className="w-5 h-5 text-red-600" />;
    }
  };

  const getProgressColor = (porcentaje: number) => {
    if (porcentaje === 100) return 'bg-emerald-500';
    if (porcentaje >= 70) return 'bg-lime-500';
    if (porcentaje >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const categorias: CategoriaHuaicoId[] = [
    'proteccion_hogar',
    'documentos_impermeables',
    'suministros_reserva',
    'evacuacion_comunitaria'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-testid="checklist-huaicos">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Checklist para Temporada de Lluvias y Huaicos</h3>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700"
            title="Restablecer valores predeterminados"
            data-testid="btn-reset-huaicos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Preparación anticipada del hogar, empaque hermético de documentos y provisiones para 72 horas de aislamiento.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Barra de Progreso General */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Preparación General ante Huaicos
            </span>
            <span
              className="text-base font-extrabold text-slate-900"
              data-testid="progreso-huaicos-porcentaje"
            >
              {metricas.porcentajeTotal}%
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(metricas.porcentajeTotal)}`}
              style={{ width: `${metricas.porcentajeTotal}%` }}
              data-testid="barra-progreso-huaicos"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              {metricas.articulosCompletados} de {metricas.totalArticulos} medidas implementadas
            </span>
            {metricas.porcentajeTotal === 100 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1" data-testid="estado-100-completado">
                <CheckCircle2 className="w-3.5 h-3.5 inline" /> ¡Hogar 100% Preparado!
              </span>
            ) : (
              <span>Meta: 100% antes del periodo de lluvias</span>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-3">
          {categorias.map(catId => {
            const catInfo = CATEGORIAS_HUAICOS[catId];
            const detalle = metricas.desglose[catId];
            const abierta = abiertas[catId];
            const items = articulos.filter(a => a.categoriaId === catId);

            return (
              <div
                key={catId}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                data-testid={`categoria-accordion-${catId}`}
              >
                {/* Cabecera del Acordeón */}
                <button
                  type="button"
                  onClick={() => toggleCategoria(catId)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      {getCategoriaIcon(catId)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {catInfo.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {detalle.completados} de {detalle.total} completados ({detalle.porcentaje}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div
                        className={`h-full ${getProgressColor(detalle.porcentaje)}`}
                        style={{ width: `${detalle.porcentaje}%` }}
                      />
                    </div>
                    {abierta ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Lista de Ítems */}
                {abierta && (
                  <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-1">
                    {items.map(item => {
                      return (
                        <div
                          key={item.id}
                          onClick={() => onToggleItem(item.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                            item.completado
                              ? 'bg-slate-50 border-slate-200/80 text-slate-500'
                              : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/50'
                          }`}
                          data-testid={`item-checklist-${item.id}`}
                          role="checkbox"
                          aria-checked={item.completado}
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              onToggleItem(item.id);
                            }
                          }}
                        >
                          <span
                            className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                              item.completado
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {item.completado && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                          </span>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span
                                className={`font-semibold text-xs sm:text-sm ${
                                  item.completado ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {item.titulo}
                              </span>

                              {item.esCritico && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200">
                                  Esencial
                                </span>
                              )}

                              {item.cantidadSugerida && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.cantidadSugerida}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed">
                              {item.descripcion}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
