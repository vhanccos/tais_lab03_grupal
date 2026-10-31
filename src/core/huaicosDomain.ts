/**
 * Dominio de Gestión Offline de Riesgo ante Huaicos e Inundaciones
 * Doctrina: SINAGERD, INDECI, SENAMHI, ANA, INGEMMET
 */

export type NivelAlertaHuaico = 'verde' | 'amarillo' | 'naranja' | 'rojo';

export type TipoSenalTemprana =
  | 'estruendo'
  | 'turbidez_olor'
  | 'represamiento_caudal'
  | 'comportamiento_animal'
  | 'vibracion_suelo'
  | 'grietas_talud';

export type CategoriaHuaicoId =
  | 'proteccion_hogar'
  | 'documentos_impermeables'
  | 'suministros_reserva'
  | 'evacuacion_comunitaria';

export interface CategoriaHuaicoInfo {
  id: CategoriaHuaicoId;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface ItemHuaicoChecklist {
  id: string;
  categoriaId: CategoriaHuaicoId;
  titulo: string;
  descripcion: string;
  completado: boolean;
  esCritico: boolean;
  cantidadSugerida?: string;
}

export interface SenalTemprana {
  id: TipoSenalTemprana;
  nombre: string;
  descripcionSensorial: string;
  causaFisica: string;
  tiempoReaccionSegundos: number;
  accionInmediata: string;
  reconocida: boolean;
  esPeligroMortal: boolean;
}

export interface PlanEvacuacionHuaico {
  puntoEncuentroCotaAlta: string;
  descripcionRutaPerpendicular: string;
  contactoReferenciaNombre: string;
  contactoReferenciaTelefono: string; // 9 dígitos
  viviendaEnRiesgoAbanico: boolean;
  fechaActualizacion: string;
}

export interface HuaicosState {
  version: number;
  ultimaModificacion: string;
  nivelAlertaActual: NivelAlertaHuaico;
  articulos: ItemHuaicoChecklist[];
  senalesTempranas: SenalTemprana[];
  planEvacuacion: PlanEvacuacionHuaico;
}

// Alias para compatibilidad de nomenclatura
export type HuaicoState = HuaicosState;

export interface DetalleCategoriaHuaico {
  categoriaId: CategoriaHuaicoId;
  nombre: string;
  total: number;
  completados: number;
  porcentaje: number;
}

export interface MetricaProgresoHuaico {
  porcentajeTotal: number; // Invariante estricto [0, 100]
  totalArticulos: number;
  articulosCompletados: number;
  desglose: Record<CategoriaHuaicoId, DetalleCategoriaHuaico>;
}

export interface AlertaInfo {
  nivel: NivelAlertaHuaico;
  titulo: string;
  etiqueta: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
  descripcionRiesgo: string;
  directivaOperativa: string;
  accionesRecomendadas: string[];
}

export const CATEGORIAS_HUAICOS: Record<CategoriaHuaicoId, CategoriaHuaicoInfo> = {
  proteccion_hogar: {
    id: 'proteccion_hogar',
    nombre: 'Protección de la Vivienda',
    descripcion: 'Barreras de sacos, techos, limahoyas y desagües pluviales',
    icono: 'ShieldCheck'
  },
  documentos_impermeables: {
    id: 'documentos_impermeables',
    nombre: 'Preservación de Documentos',
    descripcion: 'Empaque estanco hermético y copias digitales fuera de red',
    icono: 'FileText'
  },
  suministros_reserva: {
    id: 'suministros_reserva',
    nombre: 'Suministros y Caja de Reserva (72h+)',
    descripcion: 'Agua potable de supervivencia, desinfectante, botas y herramientas',
    icono: 'PackageCheck'
  },
  evacuacion_comunitaria: {
    id: 'evacuacion_comunitaria',
    nombre: 'Evacuación y Alerta Comunitaria',
    descripcion: 'Ruta perpendicular 90°, silbatos, linterna estanca y brigada',
    icono: 'Mountain'
  }
};

export const DEFAULT_ITEMS_HUAICOS: ItemHuaicoChecklist[] = [
  // 1. Protección del hogar
  {
    id: 'huaico_sacos_arena',
    categoriaId: 'proteccion_hogar',
    titulo: 'Barrera de sacos de arena en accesos',
    descripcion: '10 a 20 sacos de arpillera llenos a 2/3 colocados en tresbolillo (traslape) en V invertida hacia desagüe.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '10 - 20 sacos'
  },
  {
    id: 'huaico_limpieza_techos',
    categoriaId: 'proteccion_hogar',
    titulo: 'Limpieza de canaletas y sumideros de techo',
    descripcion: 'Despejar hojas, sedimentos y ramas de canaletas y bajadas pluviales para evitar colapso de techos.',
    completado: false,
    esCritico: true
  },
  {
    id: 'huaico_fijacion_calaminas',
    categoriaId: 'proteccion_hogar',
    titulo: 'Fijación de calaminas y techos ligeros',
    descripcion: 'Refuerzo de planchas de calamina con tirafones o ganchos tipo J resistentes a vientos y acumulación hídrica.',
    completado: false,
    esCritico: false
  },
  {
    id: 'huaico_descolmatacion_cunetas',
    categoriaId: 'proteccion_hogar',
    titulo: 'Despeje de cunetas y zanjas de coronación',
    descripcion: 'Asegurar que las cunetas perimétricas que desvían aguas de cerros estén libres de desmonte o basura.',
    completado: false,
    esCritico: true
  },

  // 2. Documentos impermeables
  {
    id: 'huaico_ziploc_dni',
    categoriaId: 'documentos_impermeables',
    titulo: 'DNI y partidas en bolsa hermética impermeable',
    descripcion: 'Doble envoltura Ziploc de calibre grueso dentro de envase plástico rígido con junta de silicona.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1 juego por familiar'
  },
  {
    id: 'huaico_ziploc_propiedad',
    categoriaId: 'documentos_impermeables',
    titulo: 'Títulos de propiedad y contratos sellados',
    descripcion: 'Documentos legales de posesión, seguros de vivienda o vehículos empaquetados contra humedad e inmersión.',
    completado: false,
    esCritico: false
  },
  {
    id: 'huaico_usb_digital',
    categoriaId: 'documentos_impermeables',
    titulo: 'Respaldo digital en memoria USB impermeable',
    descripcion: 'Escaneos en PDF de alta resolución de todos los documentos y teléfonos clave en memoria USB estanca.',
    completado: false,
    esCritico: false,
    cantidadSugerida: '1 unidad USB'
  },
  {
    id: 'huaico_efectivo_fraccionado',
    categoriaId: 'documentos_impermeables',
    titulo: 'Fondo de emergencia en efectivo fraccionado',
    descripcion: 'Billetes pequeños y monedas en bolsa hermética. En aislamiento no funcionan cajeros ni billeteras digitales.',
    completado: false,
    esCritico: true,
    cantidadSugerida: 'S/ 100 - S/ 300 en monedas/billetes'
  },

  // 3. Suministros y caja de reserva 72h
  {
    id: 'huaico_agua_supervivencia',
    categoriaId: 'suministros_reserva',
    titulo: 'Reserva de agua potable (4 L/persona/día)',
    descripcion: 'Mínimo para 72 horas (3 días) por persona. Los huaicos enturbian los ríos e interrumpen la red durante días.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '12 L por persona'
  },
  {
    id: 'huaico_gotero_lejia',
    categoriaId: 'suministros_reserva',
    titulo: 'Gotero de lejía tradicional sin aroma al 5%',
    descripcion: 'Fórmula oficial INDECI: 2 gotas por litro de agua. Tiempo de reposo obligatorio: 30 minutos.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1 gotero de 30-50 ml'
  },
  {
    id: 'huaico_botas_jebe',
    categoriaId: 'suministros_reserva',
    titulo: 'Botas de jebe de caña alta',
    descripcion: 'Evitan contacto con fango infectado con leptospirosis y protegen de clavos y vidrios sumergidos.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1 par por persona'
  },
  {
    id: 'huaico_ponchos_lluvia',
    categoriaId: 'suministros_reserva',
    titulo: 'Ponchos impermeables con capucha',
    descripcion: 'Mantiene a la familia seca y previene cuadros de hipotermia durante la tormenta y evacuación.',
    completado: false,
    esCritico: false,
    cantidadSugerida: '1 por persona'
  },
  {
    id: 'huaico_herramientas_limpieza',
    categoriaId: 'suministros_reserva',
    titulo: 'Pala de punta redonda y pico pequeño',
    descripcion: 'Herramientas esenciales para descolmatar puertas y zanjas y facilitar el rescate inicial.',
    completado: false,
    esCritico: false,
    cantidadSugerida: '1 juego básico'
  },

  // 4. Evacuación comunitaria
  {
    id: 'huaico_linterna_estanca',
    categoriaId: 'evacuacion_comunitaria',
    titulo: 'Linterna LED impermeable o con dinamo',
    descripcion: 'Con baterías de repuesto o manivela. Permite orientación nocturna en corte general de alumbrado.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1-2 unidades'
  },
  {
    id: 'huaico_silbato_socorro',
    categoriaId: 'evacuacion_comunitaria',
    titulo: 'Silbatos de alta frecuencia sin bola móvil',
    descripcion: 'Código internacional de auxilio: 3 silbatazos cortos y enérgicos, pausa de 1 minuto y repetir.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1 por integrante'
  },
  {
    id: 'huaico_radio_pilas',
    categoriaId: 'evacuacion_comunitaria',
    titulo: 'Radio portátil a pilas para avisos COEN / Radio Nacional',
    descripcion: 'Para sintonizar boletines de emergencia en Radio Nacional (103.9 FM / 850 AM) cuando caen las telecomunicaciones.',
    completado: false,
    esCritico: true,
    cantidadSugerida: '1 radio + pilas'
  }
];

export const DEFAULT_SENALES_TEMPRANAS: SenalTemprana[] = [
  {
    id: 'estruendo',
    nombre: 'Estruendo o Rugido Subterráneo',
    descripcionSensorial: 'Sonido sordo, grave y retumbante continuo, similar a un avión caza o tren de carga a máxima velocidad.',
    causaFisica: 'Choque violento de miles de toneladas de rocas y macrobloques ("bolones") contra el lecho rocoso de la quebrada.',
    tiempoReaccionSegundos: 60,
    accionInmediata: '¡Evacuación extrema inmediata! Abandonar la quebrada hacia zonas altas del cerro sin mirar atrás ni recoger bienes.',
    reconocida: false,
    esPeligroMortal: true
  },
  {
    id: 'turbidez_olor',
    nombre: 'Cambio Drástico de Turbidez y Olor',
    descripcionSensorial: 'El agua del riachuelo pasa velozmente de clara a lodo marrón chocolate espeso con abundante espuma y fuerte olor a pantano.',
    causaFisica: 'Saturación hídrica masiva y arrastre de sedimentos finos en las cabeceras altas de la cuenca.',
    tiempoReaccionSegundos: 180,
    accionInmediata: 'Alejarse inmediatamente de las riberas y cauces secos; ganar al menos 20 metros de elevación respecto al nivel del cauce.',
    reconocida: false,
    esPeligroMortal: false
  },
  {
    id: 'represamiento_caudal',
    nombre: 'Cese Repentino o Secado del Caudal en Plena Tormenta',
    descripcionSensorial: 'Durante lluvias torrenciales, el caudal del riachuelo o canal disminuye súbitamente o deja de correr por completo.',
    causaFisica: 'Derrumbe o palizada aguas arriba que formó una represa natural temporal en una garganta angosta de la quebrada.',
    tiempoReaccionSegundos: 120,
    accionInmediata: '¡ALERTA MORTAL INMINENTE! Al colapsar la presa por presión hidrostática, descenderá una ola destructiva de choque ("surge"). Escalar al cerro de inmediato.',
    reconocida: false,
    esPeligroMortal: true
  },
  {
    id: 'comportamiento_animal',
    nombre: 'Estampida o Conducta Anómala de Animales',
    descripcionSensorial: 'Aves volando en bandadas huyendo de los cerros; perros ladrando desesperadamente hacia la quebrada o negándose a entrar; ganado subiendo a lomas.',
    causaFisica: 'Los animales perciben infrasonidos (< 20 Hz) y microvibraciones del terreno minutos antes de ser perceptibles por humanos.',
    tiempoReaccionSegundos: 300,
    accionInmediata: 'Ponerse en alerta máxima, tomar la mochila de emergencia y advertir a vecinos y familiares.',
    reconocida: false,
    esPeligroMortal: false
  },
  {
    id: 'vibracion_suelo',
    nombre: 'Vibración Sísmica Continua del Terreno',
    descripcionSensorial: 'Microtemblor o zumbido fino continuo bajo los pies, no oscilatorio como un terremoto, sino vibratorio y progresivo.',
    causaFisica: 'Ondas mecánicas provocadas por el rodamiento masivo de bolones de piedra por el fondo de la quebrada a menos de 500 metros.',
    tiempoReaccionSegundos: 90,
    accionInmediata: 'El frente del huaico está muy cerca. Subir inmediatamente a la ladera rocosa más próxima a 90° de la quebrada.',
    reconocida: false,
    esPeligroMortal: true
  },
  {
    id: 'grietas_talud',
    nombre: 'Fisuras de Tensión y Rodados en Taludes',
    descripcionSensorial: 'Aparición de grietas lineales en el suelo de laderas y caída continua de piedras pequeñas o tierra suelta.',
    causaFisica: 'Sobresaturación del suelo por lluvias acumuladas y pérdida de cohesión geomecánica del talud.',
    tiempoReaccionSegundos: 600,
    accionInmediata: 'Desalojar viviendas construidas al pie o sobre la ladera inestable; no estacionar vehículos bajo el talud.',
    reconocida: false,
    esPeligroMortal: false
  }
];

export const INFORMACION_ALERTAS: Record<NivelAlertaHuaico, AlertaInfo> = {
  verde: {
    nivel: 'verde',
    titulo: 'Nivel Verde: Condiciones Normales',
    etiqueta: 'NORMAL',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-500',
    colorText: 'text-emerald-900',
    colorBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    descripcionRiesgo: 'No se prevén precipitaciones anómalas ni activación de quebradas en las próximas 24 a 48 horas.',
    directivaOperativa: 'Mantener la vigilancia preventiva, revisar barreras de sacos de arena y mantener limpias canaletas y techos.',
    accionesRecomendadas: [
      'Verificar reservas de agua potable (mínimo 4 L/persona/día para 72 horas).',
      'Despejar canaletas de techos y zanjas de desagüe perimétricas.',
      'Comprobar empaque estanco e impermeable de documentos familiares.'
    ]
  },
  amarillo: {
    nivel: 'amarillo',
    titulo: 'Nivel Amarillo: Precaución y Vigilancia',
    etiqueta: 'PRECAUCIÓN',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-500',
    colorText: 'text-amber-950',
    colorBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    descripcionRiesgo: 'Precipitaciones moderadas con posibilidad de activación de quebradas de regular intensidad e incremento de caudales.',
    directivaOperativa: 'Atención a boletines oficiales del SENAMHI/COEN. Colocar sacos de arena en umbrales de puertas y preparar mochila.',
    accionesRecomendadas: [
      'Colocar barreras de sacos de arena en tresbolillo frente a accesos vulnerables.',
      'Cargar teléfonos móviles y baterías portátiles mientras haya fluido eléctrico.',
      'Monitorear la quebrada vecina y verificar que la ruta perpendicular esté despejada.'
    ]
  },
  naranja: {
    nivel: 'naranja',
    titulo: 'Nivel Naranja: Peligro Severo',
    etiqueta: 'RIESGO ALTO',
    colorBg: 'bg-orange-50',
    colorBorder: 'border-orange-500',
    colorText: 'text-orange-950',
    colorBadge: 'bg-orange-100 text-orange-800 border-orange-300',
    descripcionRiesgo: 'Lluvias intensas generalizadas con alta probabilidad de flujos de detritos importantes, deslizamientos y corte de vías.',
    directivaOperativa: 'Preparar evacuación inmediata de niños, adultos mayores y mascotas. No transitar por badenes ni cruzar quebradas.',
    accionesRecomendadas: [
      'Trasladar a personas vulnerables hacia la zona segura en cota alta previamente acordada.',
      'Tener la mochila de emergencia y calzado de jebe listos junto a la salida.',
      'Bajar la llave eléctrica general y cerrar llave de paso de gas si el lodo se aproxima.'
    ]
  },
  rojo: {
    nivel: 'rojo',
    titulo: 'Nivel Rojo: Peligro Extremo e Inminente',
    etiqueta: 'EVACUACIÓN INMEDIATA',
    colorBg: 'bg-red-50',
    colorBorder: 'border-red-600',
    colorText: 'text-red-950',
    colorBadge: 'bg-red-100 text-red-800 border-red-300',
    descripcionRiesgo: 'Precipitaciones torrenciales extraordinarias. Activación generalizada y destructiva de quebradas en curso o inminente.',
    directivaOperativa: '¡EVACUACIÓN FORZOSA INMEDIATA A ZONAS ALTAS EN MENOS DE 60 SEGUNDOS! Prohibido rescatar pertenencias o circular en vehículos.',
    accionesRecomendadas: [
      'Subir perpendicularmente (90°) hacia laderas rocosas firmes fuera del abanico aluvial.',
      'NUNCA correr hacia abajo a lo largo del cauce de la quebrada.',
      'NO intentar cruzar flujos de lodo (15 cm derriban a un adulto; 30 cm arrastran autos).'
    ]
  }
};

/**
 * Cálculo reactivo puro del progreso estacional de preparación ante huaicos.
 * Invariante matemático: Total = 0 ? 0 : round((completados / total) * 100).
 * Rango acotado estrictamente a [0, 100].
 */
export function calcularProgresoHuaicos(articulos: ItemHuaicoChecklist[]): MetricaProgresoHuaico {
  const desglose: Record<CategoriaHuaicoId, DetalleCategoriaHuaico> = {
    proteccion_hogar: {
      categoriaId: 'proteccion_hogar',
      nombre: CATEGORIAS_HUAICOS.proteccion_hogar.nombre,
      total: 0,
      completados: 0,
      porcentaje: 0
    },
    documentos_impermeables: {
      categoriaId: 'documentos_impermeables',
      nombre: CATEGORIAS_HUAICOS.documentos_impermeables.nombre,
      total: 0,
      completados: 0,
      porcentaje: 0
    },
    suministros_reserva: {
      categoriaId: 'suministros_reserva',
      nombre: CATEGORIAS_HUAICOS.suministros_reserva.nombre,
      total: 0,
      completados: 0,
      porcentaje: 0
    },
    evacuacion_comunitaria: {
      categoriaId: 'evacuacion_comunitaria',
      nombre: CATEGORIAS_HUAICOS.evacuacion_comunitaria.nombre,
      total: 0,
      completados: 0,
      porcentaje: 0
    }
  };

  if (!articulos || articulos.length === 0) {
    return {
      porcentajeTotal: 0,
      totalArticulos: 0,
      articulosCompletados: 0,
      desglose
    };
  }

  let totalCompletados = 0;

  for (const item of articulos) {
    if (desglose[item.categoriaId]) {
      desglose[item.categoriaId].total += 1;
      if (item.completado) {
        desglose[item.categoriaId].completados += 1;
        totalCompletados += 1;
      }
    }
  }

  // Calcular porcentaje por categoría
  (Object.keys(desglose) as CategoriaHuaicoId[]).forEach(catId => {
    const cat = desglose[catId];
    cat.porcentaje = cat.total === 0 ? 0 : Math.min(100, Math.max(0, Math.round((cat.completados / cat.total) * 100)));
  });

  const totalItems = articulos.length;
  const porcentajeTotal = Math.min(100, Math.max(0, Math.round((totalCompletados / totalItems) * 100)));

  return {
    porcentajeTotal,
    totalArticulos: totalItems,
    articulosCompletados: totalCompletados,
    desglose
  };
}

export interface ResultadoPotabilizacion {
  litros: number;
  gotasLejia: number;
  pastillasSugeridas: number;
  minutosReposo: number;
  esValido: boolean;
  advertencia?: string;
  instruccionesClave: string[];
}

/**
 * Calculador offline de potabilización de agua según fórmula oficial de INDECI / MINSA:
 * - 2 gotas de lejía tradicional sin olor (hipoclorito de sodio al 5%) por cada 1 litro de agua clara.
 * - Reposo estricto de 30 minutos antes de consumir.
 * - Si el agua está turbia, debe filtrarse previamente con paño limpio o dejar sedimentar antes de clorar.
 */
export function calcularPotabilizacionAgua(litrosInput: number): ResultadoPotabilizacion {
  if (typeof litrosInput !== 'number' || isNaN(litrosInput) || litrosInput <= 0) {
    return {
      litros: 0,
      gotasLejia: 0,
      pastillasSugeridas: 0,
      minutosReposo: 30,
      esValido: false,
      advertencia: 'Ingrese un volumen de agua válido y mayor a 0 litros.',
      instruccionesClave: []
    };
  }

  // Acotar a un volumen razonable para evitar números disparatados
  const litrosNormalizados = Math.min(10000, litrosInput);
  const gotasLejia = Math.ceil(litrosNormalizados * 2);
  // Para bidones o tanques grandes, pastillas potabilizadoras (1 pastilla de 8.5mg Cloro activo cada 5 L o 1 de 67mg cada 20-25 L)
  const pastillasSugeridas = Math.max(1, Math.ceil(litrosNormalizados / 5));

  return {
    litros: litrosNormalizados,
    gotasLejia,
    pastillasSugeridas,
    minutosReposo: 30,
    esValido: true,
    instruccionesClave: [
      `Agregar exactamente ${gotasLejia} gotas de lejía tradicional (5% hipoclorito sin aroma).`,
      'Mezclar y tapar el recipiente para evitar contaminación.',
      'Dejar reposar 30 minutos obligatoriamente antes de beber o cocinar.',
      'Si el agua presenta turbidez visible, fíltrela con una tela limpia antes de dosificar la lejía.'
    ]
  };
}

/**
 * Validador de número celular peruano de 9 dígitos (/^9\d{8}$/)
 */
export function validarTelefonoPeru(numero: string): boolean {
  if (!numero) return false;
  const limpio = numero.trim();
  return /^9\d{8}$/.test(limpio);
}

/**
 * Crea el estado inicial por defecto para el módulo de huaicos
 */
export function createDefaultHuaicosState(): HuaicosState {
  return {
    version: 1,
    ultimaModificacion: new Date().toISOString(),
    nivelAlertaActual: 'verde',
    articulos: JSON.parse(JSON.stringify(DEFAULT_ITEMS_HUAICOS)),
    senalesTempranas: JSON.parse(JSON.stringify(DEFAULT_SENALES_TEMPRANAS)),
    planEvacuacion: {
      puntoEncuentroCotaAlta: '',
      descripcionRutaPerpendicular: '',
      contactoReferenciaNombre: '',
      contactoReferenciaTelefono: '',
      viviendaEnRiesgoAbanico: false,
      fechaActualizacion: new Date().toISOString()
    }
  };
}
