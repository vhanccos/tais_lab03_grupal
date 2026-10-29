import React, { useState } from 'react';
import { PhoneCall, Mic, Volume2, Info, AlertTriangle } from 'lucide-react';
import { generate119Uris } from '../../core/phoneValidator';

interface AccesoRapido119Props {
  numeroFamiliarClave: string;
  onSaveNumero: (numero: string) => void;
}

export const AccesoRapido119: React.FC<AccesoRapido119Props> = ({
  numeroFamiliarClave,
  onSaveNumero
}) => {
  const [telefono, setTelefono] = useState(numeroFamiliarClave);
  const uris = generate119Uris(telefono);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 9);
    setTelefono(rawVal);
    onSaveNumero(rawVal);
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-red-900 text-base flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-red-600" />
          <span>Servicio Nacional 119 - Mensajería de Voz</span>
        </h3>
        <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full">
          Gratuito
        </span>
      </div>

      <p className="text-xs text-red-800 mb-4 leading-relaxed">
        Ante sismos de gran magnitud, las líneas celulares y llamadas de voz colapsan. Utiliza el 
        <strong> 119</strong> para dejar y escuchar mensajes de voz cortos entre familiares sin congestionar las redes.
      </p>

      <div className="bg-white p-4 rounded-lg border border-red-100 shadow-xs mb-4">
        <label className="block text-xs font-bold text-slate-800 mb-1.5">
          Número de Celular Familiar Clave (9 dígitos)
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={handlePhoneChange}
          placeholder="Ej. 987654321"
          className="w-full text-base font-bold tracking-wider px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-1"
          maxLength={9}
          data-testid="input-celular-119"
        />
        <span className="text-[11px] text-slate-500">
          Acuerda con toda tu familia este mismo número de referencia para consultar los mensajes.
        </span>
      </div>

      {uris.esNumeroValido ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <a
            href={uris.grabarMensajeUri}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-4 rounded-lg transition-colors shadow-sm text-center"
            data-testid="btn-grabar-119"
          >
            <Mic className="w-4 h-4" />
            <span>Grabar Mensaje 119</span>
          </a>

          <a
            href={uris.escucharMensajeUri}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-lg transition-colors shadow-sm text-center"
            data-testid="btn-escuchar-119"
          >
            <Volume2 className="w-4 h-4" />
            <span>Escuchar Mensaje 119</span>
          </a>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Ingresa un número de celular de 9 dígitos para activar la marcación rápida del 119.</span>
        </div>
      )}

      <div className="bg-white/80 p-3 rounded-lg border border-red-100/60 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-red-600" />
          <span>Protocolo Oficial INDECI / MTC:</span>
        </div>
        <p>• <strong>Para grabar:</strong> Marca 119 + 1 + Número de Celular</p>
        <p>• <strong>Para escuchar:</strong> Marca 119 + 2 + Número de Celular</p>
        <p className="text-[11px] text-slate-500 italic mt-1">
          * Funciona sin conexión a internet desde cualquier operador móvil del país.
        </p>
      </div>
    </div>
  );
};
