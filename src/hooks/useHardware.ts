import { useState, useEffect, useRef, useCallback } from 'react';
import { RescueAudioWhistle, WhistleMode } from '../core/audioWhistle';

export interface FotoDanioEstructural {
  id: string;
  dataUrl: string;
  timestamp: string;
  nota: string;
  severidad: 'leve' | 'moderado' | 'severo';
  elemento: 'columna' | 'viga' | 'muro' | 'vidrio' | 'gas_electricidad' | 'otro';
}

const STORAGE_KEY_PHOTOS = 'sismolisto_danos_fotos_v1';

export function useFlashlight() {
  const [isOn, setIsOn] = useState(false);
  const [mode, setMode] = useState<'off' | 'steady' | 'sos'>('off');
  const [screenTorchActive, setScreenTorchActive] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState<boolean | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const sosIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intentar adquirir la pista de video con capacidad torch
  const getTrack = async (): Promise<MediaStreamTrack | null> => {
    if (trackRef.current && trackRef.current.readyState === 'live') {
      return trackRef.current;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setIsTorchSupported(false);
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      // Verificar soporte de torch
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as { torch?: boolean };
      const supported = !!capabilities.torch;
      setIsTorchSupported(supported);
      return track;
    } catch {
      setIsTorchSupported(false);
      return null;
    }
  };

  const applyHardwareTorch = async (enable: boolean) => {
    const track = await getTrack();
    if (track) {
      try {
        await track.applyConstraints({
          // @ts-expect-error torch is valid in mobile browsers supporting ImageCapture/Torch
          advanced: [{ torch: enable }]
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const stopHardwareStream = () => {
    if (trackRef.current) {
      try {
        // @ts-expect-error torch constraint
        trackRef.current.applyConstraints({ advanced: [{ torch: false }] });
        trackRef.current.stop();
      } catch {
        // Ignore errors during stream cleanup
      }
      trackRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopSos = useCallback(() => {
    if (sosIntervalRef.current) {
      clearTimeout(sosIntervalRef.current);
      sosIntervalRef.current = null;
    }
  }, []);

  const turnOff = useCallback(() => {
    stopSos();
    applyHardwareTorch(false);
    stopHardwareStream();
    setIsOn(false);
    setMode('off');
    setScreenTorchActive(false);
  }, [stopSos]);

  const toggleSteady = useCallback(async () => {
    if (mode === 'steady') {
      turnOff();
      return;
    }

    stopSos();
    const hardwareSuccess = await applyHardwareTorch(true);
    if (!hardwareSuccess) {
      // Activar pantalla blanca como respaldo
      setScreenTorchActive(true);
    }
    setIsOn(true);
    setMode('steady');
  }, [mode, turnOff, stopSos]);

  /**
   * Secuencia Morse SOS: ... --- ...
   * 3 cortos (200ms on, 200ms off)
   * 3 largos (600ms on, 200ms off)
   * 3 cortos (200ms on, 200ms off)
   * Pausa final 1400ms y repite
   */
  const toggleSos = useCallback(async () => {
    if (mode === 'sos') {
      turnOff();
      return;
    }

    stopSos();
    setIsOn(true);
    setMode('sos');

    // Patrón Morse: array de duraciones [onMs, offMs, onMs, offMs, ...]
    const morsePattern = [
      200, 200, 200, 200, 200, 200, // ... (3 cortos)
      600, 200, 600, 200, 600, 200, // --- (3 largos)
      200, 200, 200, 200, 200, 1400 // ... (3 cortos + pausa fin)
    ];

    let stepIndex = 0;

    const runMorseStep = () => {
      const isPulseOn = stepIndex % 2 === 0;
      const duration = morsePattern[stepIndex];

      applyHardwareTorch(isPulseOn);
      setScreenTorchActive(isPulseOn);

      stepIndex = (stepIndex + 1) % morsePattern.length;
      sosIntervalRef.current = setTimeout(runMorseStep, duration);
    };

    runMorseStep();
  }, [mode, turnOff, stopSos]);

  useEffect(() => {
    return () => {
      stopSos();
      stopHardwareStream();
    };
  }, [stopSos]);

  return {
    isOn,
    mode,
    screenTorchActive,
    isTorchSupported,
    toggleSteady,
    toggleSos,
    turnOff,
    setScreenTorchActive
  };
}

export function useCamera() {
  const [photos, setPhotos] = useState<FotoDanioEstructural[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY_PHOTOS);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Ignorar error de deserialización
    }
    return [];
  });

  const savePhotos = (updated: FotoDanioEstructural[]) => {
    setPhotos(updated);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
      }
    } catch {
      // Fallback silencioso si cuota excedida
    }
  };

  const addPhotoFromDataUrl = (
    dataUrl: string,
    nota: string = '',
    severidad: 'leve' | 'moderado' | 'severo' = 'moderado',
    elemento: 'columna' | 'viga' | 'muro' | 'vidrio' | 'gas_electricidad' | 'otro' = 'columna'
  ) => {
    const nuevaFoto: FotoDanioEstructural = {
      id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dataUrl,
      timestamp: new Date().toISOString(),
      nota: nota.trim(),
      severidad,
      elemento
    };
    savePhotos([nuevaFoto, ...photos]);
    return nuevaFoto;
  };

  const removePhoto = (id: string) => {
    savePhotos(photos.filter(p => p.id !== id));
  };

  return {
    photos,
    addPhotoFromDataUrl,
    removePhoto
  };
}

export function useWhistle() {
  const whistleRef = useRef<RescueAudioWhistle | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<WhistleMode>('off');
  const [blastIndex, setBlastIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    const whistle = new RescueAudioWhistle(3000);
    whistle.setListener(state => {
      setIsActive(state.isActive);
      setMode(state.mode);
      setBlastIndex(state.currentBlastIndex);
    });
    whistleRef.current = whistle;

    return () => {
      whistle.stop();
    };
  }, []);

  const startContinuous = useCallback(() => {
    whistleRef.current?.startContinuous();
  }, []);

  const startRuleOfThree = useCallback(() => {
    whistleRef.current?.startRuleOfThree();
  }, []);

  const stop = useCallback(() => {
    whistleRef.current?.stop();
  }, []);

  return {
    isActive,
    mode,
    blastIndex,
    startContinuous,
    startRuleOfThree,
    stop
  };
}

export function useHardware() {
  const flashlight = useFlashlight();
  const camera = useCamera();
  const whistle = useWhistle();
  return {
    flashlight,
    camera,
    whistle
  };
}
