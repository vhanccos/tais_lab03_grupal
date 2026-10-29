# Contratos de Interfaz: Adaptador de Persistencia Offline

**Feature**: `001-sismolisto-offline`
**Type**: Storage Service Contract

Define la capa de abstracción para la lectura, escritura y resiliencia ante corrupción de datos locales.

## 1. Interfaz del Adaptador

```typescript
export interface AppState {
  version: number;
  ultimaModificacion: string;
  mochila: {
    articulos: ArticuloMochila[];
  };
  planFamiliar: PlanFamiliar;
}

export interface IStorageAdapter {
  loadState(): AppState;
  saveState(state: AppState): boolean;
  clearState(): void;
}
```

## 2. Invariantes de Resiliencia

- **Manejo de Errores de Lectura (`loadState`)**:
  - Si `localStorage.getItem(STORAGE_KEY)` es nulo o el JSON contiene errores sintácticos/estructurales, el adaptador devuelve un estado predeterminado válido conteniendo el catálogo base de INDECI.
  - No debe propagar excepciones que bloqueen el inicio de la app.
- **Manejo de Errores de Escritura (`saveState`)**:
  - Si la cuota de almacenamiento está excedida (`QuotaExceededError`) o el navegador restringe el acceso, el adaptador captura el error y mantiene el estado en memoria para que la sesión del usuario no se interrumpa.
