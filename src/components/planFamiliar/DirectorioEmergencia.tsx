import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Flame, Home, HeartHandshake, Truck } from 'lucide-react';
import { CONTACTOS_EMERGENCIA_PERU, ContactoEmergencia } from '../../core/emergencyContacts';

const ICONS_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  PhoneCall: <PhoneCall className="w-5 h-5" />
};

export const DirectorioEmergencia: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-1">
        <PhoneCall className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-slate-900 text-base">
          Directorio Telefónico de Emergencias Nacionales
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Líneas directas de auxilio en el Perú (sin costo). Toca para marcar de forma inmediata sin necesidad de internet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CONTACTOS_EMERGENCIA_PERU.map((contacto: ContactoEmergencia) => (
          <a
            key={contacto.numero}
            href={contacto.uri}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-all group min-h-[56px]"
            data-testid={`tel-${contacto.numero}`}
            aria-label={`Llamar a ${contacto.nombre} al número ${contacto.numero}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${contacto.color} shadow-xs`}>
                {ICONS_MAP[contacto.icono] || <PhoneCall className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">{contacto.nombre}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                    {contacto.entidad}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {contacto.descripcion}
                </p>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <span className="text-sm font-black text-red-600 font-mono tracking-wider bg-white px-2 py-1 rounded-md border border-slate-200 group-hover:bg-red-50">
                {contacto.numero}
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <span className="font-bold text-slate-700">Aviso INDECI:</span>
        <span>
          En desastres de gran magnitud, priorice el servicio 119 de mensajería de voz o SMS para no saturar las líneas de emergencia destinadas a rescate vital.
        </span>
      </div>
    </div>
  );
};
