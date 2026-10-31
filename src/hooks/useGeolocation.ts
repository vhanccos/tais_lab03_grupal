import { useState, useEffect, useCallback } from 'react';
import { CoordenadaGeo } from '../storage/stateTypes';
import { DEFAULT_LIMA_CENTER } from '../core/geoMath';

export interface GeolocationState {
  coords: CoordenadaGeo;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  cargando: boolean;
  error: string | null;
  esUbicacionSimulada: boolean;
  obtenerUbicacionActual: () => void;
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<CoordenadaGeo>(DEFAULT_LIMA_CENTER);
  const [accuracy, setAccuracy] = useState<number | null>(25);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [esUbicacionSimulada, setEsUbicacionSimulada] = useState<boolean>(false);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setCoords({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
    setAccuracy(pos.coords.accuracy ?? 15);
    setAltitude(pos.coords.altitude);
    setHeading(pos.coords.heading);
    setSpeed(pos.coords.speed);
    setTimestamp(pos.timestamp);
    setCargando(false);
    setError(null);
    setEsUbicacionSimulada(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let mensaje = 'Error al obtener posición GPS.';
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        mensaje = 'Permiso de ubicación denegado por el usuario. Mostrando ubicación predeterminada.';
        break;
      case 2: // POSITION_UNAVAILABLE
        mensaje = 'Señal satelital GPS no disponible (posible zona bajo techo). Mostrando ubicación aproximada.';
        break;
      case 3: // TIMEOUT
        mensaje = 'Tiempo de espera agotado buscando satélites GPS. Mostrando ubicación aproximada.';
        break;
    }

    setCoords(DEFAULT_LIMA_CENTER);
    setAccuracy(30);
    setCargando(false);
    setError(mensaje);
    setEsUbicacionSimulada(true);
    setTimestamp(Date.now());
  }, []);

  const obtenerUbicacionActual = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalización no soportada en este entorno.');
      setEsUbicacionSimulada(true);
      setCargando(false);
      return;
    }

    setCargando(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalización no soportada en este entorno.');
      setCoords(DEFAULT_LIMA_CENTER);
      setAccuracy(30);
      setEsUbicacionSimulada(true);
      setCargando(false);
      return;
    }

    let watchId: number | null = null;

    try {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 3000
      });
    } catch {
      setError('No se pudo inicializar el receptor GPS.');
      setCoords(DEFAULT_LIMA_CENTER);
      setEsUbicacionSimulada(true);
      setCargando(false);
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [handleSuccess, handleError]);

  return {
    coords,
    accuracy,
    altitude,
    heading,
    speed,
    timestamp,
    cargando,
    error,
    esUbicacionSimulada,
    obtenerUbicacionActual
  };
}
