import React from 'react';
import { FormIntegrante } from './FormIntegrante';
import { ListaIntegrantes } from './ListaIntegrantes';
import { ZonasSeguras } from './ZonasSeguras';
import { AccesoRapido119 } from './AccesoRapido119';
import { usePlanFamiliar } from '../../hooks/usePlanFamiliar';

export const PlanFamiliarView: React.FC = () => {
  const {
    plan,
    addIntegrante,
    removeIntegrante,
    savePuntosEncuentro,
    saveNumeroClave
  } = usePlanFamiliar();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Plan Familiar de Emergencia</h2>
        <p className="text-xs text-slate-500">
          Coordinación, roles de evacuación y canales de comunicación rápida post-sismo.
        </p>
      </div>

      <AccesoRapido119
        numeroFamiliarClave={plan.numeroFamiliarClave}
        onSaveNumero={saveNumeroClave}
      />

      <ZonasSeguras
        puntoInterno={plan.puntoEncuentroInterno}
        puntoExterno={plan.puntoEncuentroExterno}
        onSave={savePuntosEncuentro}
      />

      <FormIntegrante
        onAdd={addIntegrante}
        totalIntegrantes={plan.integrantes.length}
      />

      <ListaIntegrantes
        integrantes={plan.integrantes}
        onRemove={removeIntegrante}
      />
    </div>
  );
};
