import React, { useState, useRef } from 'react';
import {
  Flashlight,
  Volume2,
  VolumeX,
  Camera,
  Radio,
  Trash2,
  Sun,
  X
} from 'lucide-react';
import { useFlashlight, useCamera, useWhistle } from '../../hooks/useHardware';

export const HerramientasEmergencia: React.FC = () => {
  const {
    isOn: isTorchOn,
    mode: torchMode,
    screenTorchActive,
    toggleSteady,
    toggleSos,
    turnOff: turnOffTorch,
    setScreenTorchActive
  } = useFlashlight();

  const {
    isActive: isWhistleActive,
    mode: whistleMode,
    blastIndex,
    startContinuous,
    startRuleOfThree,
    stop: stopWhistle
  } = useWhistle();

  const {
    photos,
    addPhotoFromDataUrl,
    removePhoto
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoNota, setPhotoNota] = useState('');
  const [photoSeveridad, setPhotoSeveridad] = useState<'leve' | 'moderado' | 'severo'>('moderado');
  const [photoElemento, setPhotoElemento] = useState<'columna' | 'viga' | 'muro' | 'vidrio' | 'gas_electricidad' | 'otro'>('columna');
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setPendingDataUrl(url);
          setIsPhotoFormOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    // Limpiar input para permitir capturas consecutivas
    e.target.value = '';
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingDataUrl) {
      addPhotoFromDataUrl(pendingDataUrl, photoNota, photoSeveridad, photoElemento);
      setPendingDataUrl(null);
      setPhotoNota('');
      setIsPhotoFormOpen(false);
    }
  };

  const getSeveridadBadge = (sev: string) => {
    switch (sev) {
      case 'severo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderado':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'leve':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Superposición de Pantalla Blanca Linterna de Respaldo */}
      {screenTorchActive && (
        <div
          onClick={() => setScreenTorchActive(false)}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-black cursor-pointer select-none"
          data-testid="screen-torch-overlay"
        >
          <Sun className="w-24 h-24 text-amber-400 animate-pulse mb-4" />
          <h2 className="text-2xl font-black mb-2">Luz de Pantalla Activa</h2>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Brillo de pantalla al máximo para iluminación de emergencia. Toca cualquier lugar para apagar.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setScreenTorchActive(false);
              turnOffTorch();
            }}
            className="mt-8 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg min-h-[44px]"
          >
            Apagar Luz de Pantalla
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Herramientas SOS y Hardware</h2>
        <p className="text-xs text-slate-500">
          Utilidades de supervivencia que operan 100% autónomas sin conexión celular ni eléctrica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MÓDULO 1: LINTERNA Y SEÑAL SOS ÓPTICA */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flashlight className={`w-5 h-5 ${isTorchOn ? 'text-amber-500' : 'text-slate-600'}`} />
              <h3 className="font-bold text-slate-900 text-base">Linterna y Destello SOS</h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                torchMode !== 'off'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {torchMode === 'steady' ? 'Fija' : torchMode === 'sos' ? 'SOS Morse' : 'Apagada'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Iluminación LED con flash de cámara o pantalla blanca en apagones totales sin peligro de fuga de gas.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={toggleSteady}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all min-h-[56px] border ${
                torchMode === 'steady'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              data-testid="btn-torch-steady"
            >
              <Sun className="w-5 h-5" />
              <span>{torchMode === 'steady' ? 'Apagar Linterna' : 'Luz Continua'}</span>
            </button>

            <button
              onClick={toggleSos}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all min-h-[56px] border ${
                torchMode === 'sos'
                  ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              data-testid="btn-torch-sos"
            >
              <Radio className="w-5 h-5" />
              <span>{torchMode === 'sos' ? 'Detener SOS' : 'Modo SOS Morse'}</span>
            </button>
          </div>

          <button
            onClick={() => setScreenTorchActive(true)}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            data-testid="btn-screen-torch"
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Activar Pantalla Blanca de Alto Brillo</span>
          </button>
        </div>

        {/* MÓDULO 2: SILBATO DE RESCATE ACÚSTICO */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-5 h-5 ${isWhistleActive ? 'text-red-600 animate-pulse' : 'text-slate-600'}`} />
              <h3 className="font-bold text-slate-900 text-base">Silbato de Rescate Acústico</h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isWhistleActive
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {whistleMode === 'continuous' ? 'Continuo' : whistleMode === 'rule_of_three' ? 'Regla de 3' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Tono de rescate de 3000 Hz (frecuencia óptima de audición humana) para personas atrapadas bajo escombros.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={startContinuous}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all min-h-[56px] border ${
                whistleMode === 'continuous'
                  ? 'bg-red-600 text-white border-red-700 shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              data-testid="btn-whistle-continuous"
            >
              <Volume2 className="w-5 h-5" />
              <span>Silbatazo Continuo</span>
            </button>

            <button
              onClick={startRuleOfThree}
              className={`p-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all min-h-[56px] border ${
                whistleMode === 'rule_of_three'
                  ? 'bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-400'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              data-testid="btn-whistle-rule-of-three"
            >
              <Radio className="w-5 h-5" />
              <span>Poder del Tres (3 Pitidos)</span>
            </button>
          </div>

          {isWhistleActive && (
            <button
              onClick={stopWhistle}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              data-testid="btn-whistle-stop"
            >
              <VolumeX className="w-4 h-4" />
              <span>Detener Alarma Acústica</span>
            </button>
          )}

          {whistleMode === 'rule_of_three' && (
            <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-600 text-center font-medium">
              {blastIndex && blastIndex > 0 ? (
                <span className="text-red-600 font-bold">Emitiendo pitido #{blastIndex} de 3...</span>
              ) : (
                <span className="text-slate-500">Silencio de 60s: brigadas de rescate escuchando...</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MÓDULO 3: CÁMARA Y DOCUMENTACIÓN RÁPIDA DE DAÑOS */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Registro Fotográfico de Daños Estructurales</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fotografía y clasifica grietas en columnas, vigas o muros para evaluación técnica de INDECI.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              data-testid="file-input-damage"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm min-h-[44px]"
              data-testid="btn-capture-photo"
            >
              <Camera className="w-4 h-4" />
              <span>Tomar / Subir Foto</span>
            </button>
          </div>
        </div>

        {/* Modal para clasificar la foto recién capturada */}
        {isPhotoFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Clasificar Daño Estructural</h3>
                <button onClick={() => setIsPhotoFormOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="p-6 space-y-4">
                {pendingDataUrl && (
                  <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-200 bg-black flex items-center justify-center">
                    <img src={pendingDataUrl} alt="Vista previa del daño" className="max-h-full object-contain" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Elemento Afectado
                  </label>
                  <select
                    value={photoElemento}
                    onChange={(e) => setPhotoElemento(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="columna">Columna de concreto</option>
                    <option value="viga">Viga principal</option>
                    <option value="muro">Muro o tabique</option>
                    <option value="vidrio">Vidrios o ventanas</option>
                    <option value="gas_electricidad">Instalación de Gas / Eléctrica</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nivel de Severidad
                  </label>
                  <select
                    value={photoSeveridad}
                    onChange={(e) => setPhotoSeveridad(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="leve">Leve (Fisuras superficiales)</option>
                    <option value="moderado">Moderado (Grietas sin desprendimiento)</option>
                    <option value="severo">Severo (Grieta diagonal en X o deformación)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Notas u Observación (Opcional)
                  </label>
                  <input
                    type="text"
                    value={photoNota}
                    onChange={(e) => setPhotoNota(e.target.value)}
                    placeholder="Ej. Grieta diagonal en columna del dormitorio..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPhotoFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg min-h-[44px]"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Galería de fotos guardadas */}
        {photos.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            No hay registros de daños almacenados. Utiliza el botón superior para documentar cualquier afectación estructural.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {photos.map((foto) => (
              <div
                key={foto.id}
                className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between"
                data-testid={`foto-danio-${foto.id}`}
              >
                <div className="h-36 bg-black flex items-center justify-center overflow-hidden">
                  <img src={foto.dataUrl} alt={foto.elemento} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 capitalize">{foto.elemento}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeveridadBadge(
                        foto.severidad
                      )}`}
                    >
                      {foto.severidad}
                    </span>
                  </div>
                  {foto.nota && <p className="text-xs text-slate-600 mb-2 truncate">{foto.nota}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>{new Date(foto.timestamp).toLocaleDateString()}</span>
                    <button
                      onClick={() => removePhoto(foto.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar registro"
                      data-testid={`btn-del-photo-${foto.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
