import React, { useState } from 'react';
import { FormIntegrante } from './FormIntegrante';
import { ListaIntegrantes } from './ListaIntegrantes';
import { ZonasSeguras } from './ZonasSeguras';
import { AccesoRapido119 } from './AccesoRapido119';
import { DirectorioEmergencia } from './DirectorioEmergencia';
import { usePlanFamiliar } from '../../hooks/usePlanFamiliar';
import { IntegranteFamiliar } from '../../storage/stateTypes';

export const PlanFamiliarView: React.FC = () => {
  const {
    plan,
    addIntegrante,
    updateIntegrante,
    removeIntegrante,
    addPuntoEncuentro,
    updatePuntoEncuentro,
    deletePuntoEncuentro,
    savePuntosEncuentro,
    saveNumeroClave
  } = usePlanFamiliar();

  const [editingMember, setEditingMember] = useState<IntegranteFamiliar | null>(null);

  const handleEditMember = (member: IntegranteFamiliar) => {
    setEditingMember(member);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Plan Familiar de Emergencia</h2>
        <p className="text-xs text-slate-500">
          Coordinación, roles de evacuación (I-U-E-A-O) y canales de comunicación rápida post-sismo (INDECI).
        </p>
      </div>

      {/* Central Telefónica de Emergencias Nacionales */}
      <DirectorioEmergencia />

      {/* Acceso Rápido 119 de Mensajería de Voz */}
      <AccesoRapido119
        numeroFamiliarClave={plan.numeroFamiliarClave}
        onSaveNumero={saveNumeroClave}
      />

      {/* Puntos y Zonas Seguras de Encuentro (Full CRUD) */}
      <ZonasSeguras
        puntoInterno={plan.puntoEncuentroInterno}
        puntoExterno={plan.puntoEncuentroExterno}
        onSave={savePuntosEncuentro}
        puntosEncuentro={plan.puntosEncuentro}
        onAddPunto={addPuntoEncuentro}
        onUpdatePunto={updatePuntoEncuentro}
        onDeletePunto={deletePuntoEncuentro}
      />

      {/* Formulario de Integrante (Crear / Editar) */}
      <FormIntegrante
        onAdd={addIntegrante}
        onUpdate={updateIntegrante}
        onCancelEdit={handleCancelEdit}
        editingMember={editingMember}
        totalIntegrantes={plan.integrantes.length}
      />

      {/* Lista de Integrantes con soporte de Edición y Eliminación */}
      <ListaIntegrantes
        integrantes={plan.integrantes}
        onRemove={removeIntegrante}
        onEdit={handleEditMember}
      />
    </div>
  );
};
