import React, { useState } from 'react';
import {
  PlanEvacuacionHuaico,
  validarTelefonoPeru
} from '../../core/huaicosDomain';
import {
  Compass,
  ArrowUpRight,
  AlertTriangle,
  PhoneCall,
  Save,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Home,
  MapPin
} from 'lucide-react';

interface GuiaEvacuacionPerpendicularProps {
  plan: PlanEvacuacionHuaico;
  onGuardarPlan: (plan: Partial<PlanEvacuacionHuaico>) => void;
}

export const GuiaEvacuacionPerpendicular: React.FC<GuiaEvacuacionPerpendicularProps> = ({
  plan,
  onGuardarPlan
}) => {
  const [puntoEncuentro, setPuntoEncuentro] = useState(plan?.puntoEncuentroCotaAlta ?? '');
  const [ruta, setRuta] = useState(plan?.descripcionRutaPerpendicular ?? '');
  const [contactoNombre, setContactoNombre] = useState(plan?.contactoReferenciaNombre ?? '');
  const [contactoTelefono, setContactoTelefono] = useState(plan?.contactoReferenciaTelefono ?? '');
  const [enAbanico, setEnAbanico] = useState(Boolean(plan?.viviendaEnRiesgoAbanico));

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const puntoTrim = (puntoEncuentro || '').trim();
    if (!puntoTrim) {
      setErrorValidacion('Debe ingresar el nombre o ubicación de la zona segura en cota alta.');
      return;
    }

    const telefonoTrim = (contactoTelefono || '').trim();
    if (telefonoTrim && !validarTelefonoPeru(telefonoTrim)) {
      setErrorValidacion('El teléfono de contacto debe tener 9 dígitos y comenzar con 9 (ej. 987654321).');
      return;
    }

    onGuardarPlan({
      puntoEncuentroCotaAlta: puntoTrim,
      descripcionRutaPerpendicular: (ruta || '').trim(),
      contactoReferenciaNombre: (contactoNombre || '').trim(),
      contactoReferenciaTelefono: telefonoTrim,
      viviendaEnRiesgoAbanico: Boolean(enAbanico)
    });

    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

  const telefonoValido = validarTelefonoPeru(contactoTelefono || '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" data-testid="guia-evacuacion">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Evacuación Perpendicular (Regla de 90°)</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500">
            Regla de Oro
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          La única dirección de supervivencia ante un aluvión o flujo de detritos es ganar altura hacia laderas firmes.
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Diagrama Esquemático / Regla de los 90° */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-inner">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            La Regla del Ángulo Recto (90°)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
              <span className="text-emerald-400 font-extrabold block text-sm">
                1. SUBIR AL CERRO (90°)
              </span>
              <p className="text-slate-300">
                Al detectar el aluvión, corra perpendicularmente a la quebrada buscando roca madre y terreno elevado.
              </p>
            </div>

            <div className="bg-red-950/60 p-3.5 rounded-lg border border-red-800/80 space-y-1.5">
              <span className="text-red-400 font-extrabold block text-sm">
                2. NUNCA CORRER AGUAS ABAJO
              </span>
              <p className="text-slate-300">
                El frente del lodo viaja a 30-50 km/h y se expande en el abanico aluvial. Correr hacia abajo es fatal.
              </p>
            </div>

            <div className="bg-amber-950/60 p-3.5 rounded-lg border border-amber-800/80 space-y-1.5">
              <span className="text-amber-400 font-extrabold block text-sm">
                3. PROHIBIDO CRUZAR CORRIENTES
              </span>
              <p className="text-slate-300">
                15 cm de lodo derriban a un adulto; 30 cm desplazan autos; 60 cm arrastran camionetas 4x4 y camiones.
              </p>
            </div>
          </div>
        </div>

        {/* Advertencias críticas de profundidad de lodo */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
            <span className="text-red-700 font-black text-lg block">15 cm</span>
            <span className="text-slate-700 font-semibold text-[11px]">Derriba adultos a pie</span>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
            <span className="text-orange-700 font-black text-lg block">30 cm</span>
            <span className="text-slate-700 font-semibold text-[11px]">Arrastra vehículos ligeros</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-amber-700 font-black text-lg block">60 cm</span>
            <span className="text-slate-700 font-semibold text-[11px]">Arrastra camionetas y camiones</span>
          </div>
        </div>

        {/* Formulario de Punto Seguro en Cota Alta */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Registro Familiar de Zona Segura en Cota Alta
          </h4>

          {errorValidacion && (
            <div className="mb-3 p-3 bg-red-100 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2" data-testid="error-validacion">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {guardadoExitoso && (
            <div className="mb-3 p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2" data-testid="exito-guardado">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Punto seguro y contactos de evacuación guardados localmente.</span>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Punto de Encuentro en Cota Alta *
              </label>
              <input
                type="text"
                value={puntoEncuentro}
                onChange={e => setPuntoEncuentro(e.target.value)}
                placeholder="Ej. Plaza de la Loma Alta, Cota +80m (fuera de la faja marginal)"
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                data-testid="input-punto-alto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción de la Ruta Perpendicular de Subida
              </label>
              <input
                type="text"
                value={ruta}
                onChange={e => setRuta(e.target.value)}
                placeholder="Ej. Salir por pasaje norte hacia el cerro rocoso, subir escalinata comunitaria"
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                data-testid="input-ruta-escape"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contacto de Referencia (Nombre)
                </label>
                <input
                  type="text"
                  value={contactoNombre}
                  onChange={e => setContactoNombre(e.target.value)}
                  placeholder="Ej. Tío Carlos (fuera de zona de riesgo)"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  data-testid="input-contacto-nombre"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto (9 dígitos)
                </label>
                <input
                  type="tel"
                  maxLength={9}
                  value={contactoTelefono}
                  onChange={e => setContactoTelefono(e.target.value.replace(/\D/g, ''))}
                  placeholder="987654321"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  data-testid="input-contacto-telefono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="abanico-check"
                checked={enAbanico}
                onChange={e => setEnAbanico(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                data-testid="check-abanico-aluvial"
              />
              <label htmlFor="abanico-check" className="text-xs text-slate-700 font-medium">
                La vivienda se encuentra ubicada en cono de deyección o faja marginal (&lt; 50 m de quebrada)
              </label>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 items-center justify-between">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                data-testid="btn-guardar-plan"
              >
                <Save className="w-4 h-4" />
                Guardar Ruta y Punto Seguro
              </button>

              {telefonoValido && (
                <a
                  href={`tel:${contactoTelefono}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  data-testid="btn-llamar-contacto"
                >
                  <PhoneCall className="w-4 h-4" />
                  Llamar a {contactoNombre || 'Contacto'} ({contactoTelefono})
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Directorio de Emergencias Nacionales en Vivo */}
        <div className="border-t border-slate-200 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Centrales de Auxilio Inmediato (Marcación Directa tel:)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href="tel:115"
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center text-center transition-colors"
              data-testid="btn-tel-115"
            >
              <ShieldAlert className="w-5 h-5 text-red-600 mb-1" />
              <span className="text-xs font-extrabold text-slate-900">INDECI / COEN</span>
              <span className="text-xs font-bold text-red-600">115</span>
            </a>
            <a
              href="tel:116"
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center text-center transition-colors"
              data-testid="btn-tel-116"
            >
              <Flame className="w-5 h-5 text-red-600 mb-1" />
              <span className="text-xs font-extrabold text-slate-900">Bomberos</span>
              <span className="text-xs font-bold text-red-600">116</span>
            </a>
            <a
              href="tel:106"
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center text-center transition-colors"
              data-testid="btn-tel-106"
            >
              <PhoneCall className="w-5 h-5 text-red-600 mb-1" />
              <span className="text-xs font-extrabold text-slate-900">SAMU Ambulancia</span>
              <span className="text-xs font-bold text-red-600">106</span>
            </a>
            <a
              href="tel:105"
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center text-center transition-colors"
              data-testid="btn-tel-105"
            >
              <Home className="w-5 h-5 text-red-600 mb-1" />
              <span className="text-xs font-extrabold text-slate-900">Policía Nacional</span>
              <span className="text-xs font-bold text-red-600">105</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
