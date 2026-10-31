import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calcularDistanciaHaversine,
  calcularRumboAzimut,
  formatDistance
} from '../../src/core/geoMath';
import {
  calcularPotabilizacionAgua,
  calcularProgresoHuaicos,
  ItemHuaicoChecklist,
  CategoriaHuaicoId
} from '../../src/core/huaicosDomain';
import { calculatePreparationProgress } from '../../src/core/progressCalculator';
import { ArticuloMochila, CategoriaId, CoordenadaGeo } from '../../src/storage/stateTypes';

const CATEGORIAS_MOCHILA: CategoriaId[] = [
  'primeros_auxilios',
  'alimentos',
  'agua',
  'herramientas',
  'abrigo',
  'documentos'
];

const CATEGORIAS_HUAICOS: CategoriaHuaicoId[] = [
  'proteccion_hogar',
  'documentos_impermeables',
  'suministros_reserva',
  'evacuacion_comunitaria'
];

const EARTH_RADIUS = 6371000;
const HALF_CIRCUMFERENCE = Math.PI * EARTH_RADIUS; // approx 20,015,114.35 m

describe('Empirical Challenger 1 — Mathematical & Algorithmic Rigor', () => {

  // =========================================================================
  // 1. HAVERSINE DISTANCE FORMULA
  // =========================================================================
  describe('Haversine Distance (calcularDistanciaHaversine)', () => {
    const validCoordArbitrary = fc.record<CoordenadaGeo>({
      lat: fc.double({ min: -90, max: 90, noNaN: true }),
      lng: fc.double({ min: -180, max: 180, noNaN: true })
    });

    it('Invariant: Distance from any coordinate to itself is strictly 0', () => {
      fc.assert(
        fc.property(validCoordArbitrary, (coord) => {
          const d = calcularDistanciaHaversine(coord, coord);
          expect(d).toBe(0);
        }),
        { numRuns: 200 }
      );
    });

    it('Invariant: Distance between identical values is 0 even with distinct object references', () => {
      fc.assert(
        fc.property(validCoordArbitrary, (coord) => {
          const clone = { lat: coord.lat, lng: coord.lng };
          const d = calcularDistanciaHaversine(coord, clone);
          expect(d).toBe(0);
        }),
        { numRuns: 200 }
      );
    });

    it('Invariant: Non-negativity and finite boundedness (0 <= d <= pi * R)', () => {
      fc.assert(
        fc.property(validCoordArbitrary, validCoordArbitrary, (c1, c2) => {
          const d = calcularDistanciaHaversine(c1, c2);
          expect(d).toBeGreaterThanOrEqual(0);
          expect(d).toBeLessThanOrEqual(HALF_CIRCUMFERENCE + 1); // 1 meter tolerance
          expect(Number.isNaN(d)).toBe(false);
          expect(Number.isFinite(d)).toBe(true);
        }),
        { numRuns: 500 }
      );
    });

    it('Invariant: Symmetry d(A, B) === d(B, A) within floating-point precision', () => {
      fc.assert(
        fc.property(validCoordArbitrary, validCoordArbitrary, (c1, c2) => {
          const d12 = calcularDistanciaHaversine(c1, c2);
          const d21 = calcularDistanciaHaversine(c2, c1);
          expect(Math.abs(d12 - d21)).toBeLessThan(1e-4);
        }),
        { numRuns: 300 }
      );
    });

    it('Invariant: Spherical Triangle Inequality d(A, C) <= d(A, B) + d(B, C) + epsilon', () => {
      fc.assert(
        fc.property(validCoordArbitrary, validCoordArbitrary, validCoordArbitrary, (a, b, c) => {
          const dAC = calcularDistanciaHaversine(a, c);
          const dAB = calcularDistanciaHaversine(a, b);
          const dBC = calcularDistanciaHaversine(b, c);
          // Epsilon of 0.05 meters accounts for double-precision trigonometric rounding
          expect(dAC).toBeLessThanOrEqual(dAB + dBC + 0.05);
        }),
        { numRuns: 500 }
      );
    });

    it('Boundary Extremes: North Pole to South Pole equals half circumference', () => {
      const northPole: CoordenadaGeo = { lat: 90, lng: 0 };
      const southPole: CoordenadaGeo = { lat: -90, lng: 0 };
      const d = calcularDistanciaHaversine(northPole, southPole);
      expect(Math.abs(d - HALF_CIRCUMFERENCE)).toBeLessThan(5); // within 5 meters
    });

    it('Boundary Extremes: Equatorial antipodal points', () => {
      const c1: CoordenadaGeo = { lat: 0, lng: 0 };
      const c2: CoordenadaGeo = { lat: 0, lng: 180 };
      const d = calcularDistanciaHaversine(c1, c2);
      expect(Math.abs(d - HALF_CIRCUMFERENCE)).toBeLessThan(5);
    });

    it('Boundary Extremes: Date-line wrap-around (179.999° to -179.999°)', () => {
      const pEast: CoordenadaGeo = { lat: 0, lng: 179.999 };
      const pWest: CoordenadaGeo = { lat: 0, lng: -179.999 };
      const d = calcularDistanciaHaversine(pEast, pWest);
      // 0.002 degrees along equator = (0.002 / 360) * 2 * pi * 6371000 ~ 222.39 meters
      expect(d).toBeGreaterThan(200);
      expect(d).toBeLessThan(250);
    });
  });

  // =========================================================================
  // 2. FORWARD AZIMUTH BEARING
  // =========================================================================
  describe('Forward Azimuth Bearing (calcularRumboAzimut)', () => {
    it('Invariant: Bearing to identical point returns 0°', () => {
      const p: CoordenadaGeo = { lat: -12.046, lng: -77.042 };
      expect(calcularRumboAzimut(p, p)).toBe(0);
      expect(calcularRumboAzimut(p, { lat: p.lat, lng: p.lng })).toBe(0);
    });

    it('Exact Cardinal Angles: True North (0°), East (90°), South (180°), West (270°)', () => {
      const origin: CoordenadaGeo = { lat: 0, lng: 0 };

      // Due North
      const north: CoordenadaGeo = { lat: 10, lng: 0 };
      expect(calcularRumboAzimut(origin, north)).toBeCloseTo(0, 5);

      // Due East
      const east: CoordenadaGeo = { lat: 0, lng: 10 };
      expect(calcularRumboAzimut(origin, east)).toBeCloseTo(90, 5);

      // Due South
      const south: CoordenadaGeo = { lat: -10, lng: 0 };
      expect(calcularRumboAzimut(origin, south)).toBeCloseTo(180, 5);

      // Due West
      const west: CoordenadaGeo = { lat: 0, lng: -10 };
      expect(calcularRumboAzimut(origin, west)).toBeCloseTo(270, 5);
    });

    it('Exact Cardinal Angles in Southern Hemisphere (Lima context)', () => {
      const limaCenter: CoordenadaGeo = { lat: -12.046374, lng: -77.042793 };

      // Moving North towards Rimac
      const limaNorth: CoordenadaGeo = { lat: -11.046374, lng: -77.042793 };
      expect(calcularRumboAzimut(limaCenter, limaNorth)).toBeCloseTo(0, 4);

      // Moving South towards Miraflores
      const limaSouth: CoordenadaGeo = { lat: -13.046374, lng: -77.042793 };
      expect(calcularRumboAzimut(limaCenter, limaSouth)).toBeCloseTo(180, 4);
    });

    it('Invariant: Azimuth bearing is strictly in [0, 360) and never NaN or 360', () => {
      const coordArbitrary = fc.record<CoordenadaGeo>({
        lat: fc.double({ min: -85, max: 85, noNaN: true }),
        lng: fc.double({ min: -180, max: 180, noNaN: true })
      });

      fc.assert(
        fc.property(coordArbitrary, coordArbitrary, (c1, c2) => {
          const bearing = calcularRumboAzimut(c1, c2);
          expect(bearing).toBeGreaterThanOrEqual(0);
          expect(bearing).toBeLessThan(360);
          expect(Number.isNaN(bearing)).toBe(false);
          expect(Number.isFinite(bearing)).toBe(true);
        }),
        { numRuns: 500 }
      );
    });
  });

  // =========================================================================
  // 3. WATER CHLORINATION FORMULA
  // =========================================================================
  describe('Water Chlorination Formula (calcularPotabilizacionAgua)', () => {
    it('Boundary: 0 Liters must fail validation and yield 0 drops', () => {
      const res = calcularPotabilizacionAgua(0);
      expect(res.esValido).toBe(false);
      expect(res.gotasLejia).toBe(0);
      expect(res.litros).toBe(0);
      expect(res.advertencia).toBeDefined();
    });

    it('Boundary: Negative liters must fail validation and yield 0 drops', () => {
      const resNeg = calcularPotabilizacionAgua(-5);
      expect(resNeg.esValido).toBe(false);
      expect(resNeg.gotasLejia).toBe(0);
      expect(resNeg.advertencia).toBeDefined();

      const resSmallNeg = calcularPotabilizacionAgua(-0.001);
      expect(resSmallNeg.esValido).toBe(false);
      expect(resSmallNeg.gotasLejia).toBe(0);
    });

    it('Boundary: NaN, negative infinity, and non-numbers must fail safely', () => {
      expect(calcularPotabilizacionAgua(NaN).esValido).toBe(false);
      expect(calcularPotabilizacionAgua(-Infinity).esValido).toBe(false);
      // @ts-expect-error test non-number runtime abuse
      expect(calcularPotabilizacionAgua('10').esValido).toBe(false);
      // @ts-expect-error test null runtime abuse
      expect(calcularPotabilizacionAgua(null).esValido).toBe(false);
    });

    it('Boundary Behavior: Positive Infinity is clamped by Math.min(10000, input)', () => {
      // Invariant check: Positive Infinity passes isNaN and <= 0, so Math.min(10000, Infinity) clamps it to 10000L
      const resInf = calcularPotabilizacionAgua(Infinity);
      expect(resInf.esValido).toBe(true);
      expect(resInf.litros).toBe(10000);
      expect(resInf.gotasLejia).toBe(20000);
    });

    it('Standard Dosage: 1L -> 2 drops; 5L -> 10 drops; 20L -> 40 drops with 30 min rest', () => {
      const r1 = calcularPotabilizacionAgua(1);
      expect(r1.esValido).toBe(true);
      expect(r1.gotasLejia).toBe(2);
      expect(r1.minutosReposo).toBe(30);

      const r5 = calcularPotabilizacionAgua(5);
      expect(r5.esValido).toBe(true);
      expect(r5.gotasLejia).toBe(10);
      expect(r5.pastillasSugeridas).toBe(1);

      const r20 = calcularPotabilizacionAgua(20);
      expect(r20.esValido).toBe(true);
      expect(r20.gotasLejia).toBe(40);
      expect(r20.pastillasSugeridas).toBe(4);
    });

    it('Boundary: Fractional liters ceil to safe minimum (0.5L -> 1 drop, 0.1L -> 1 drop)', () => {
      const rHalf = calcularPotabilizacionAgua(0.5);
      expect(rHalf.esValido).toBe(true);
      expect(rHalf.gotasLejia).toBe(1);

      const rTiny = calcularPotabilizacionAgua(0.1);
      expect(rTiny.esValido).toBe(true);
      expect(rTiny.gotasLejia).toBe(1); // Math.ceil(0.1 * 2) = 1

      const rFrac = calcularPotabilizacionAgua(2.3);
      expect(rFrac.esValido).toBe(true);
      expect(rFrac.gotasLejia).toBe(5); // Math.ceil(4.6) = 5
    });

    it('Boundary: 10,000 Liters and upper bound ceiling clamp', () => {
      const r10k = calcularPotabilizacionAgua(10000);
      expect(r10k.esValido).toBe(true);
      expect(r10k.litros).toBe(10000);
      expect(r10k.gotasLejia).toBe(20000);
      expect(r10k.pastillasSugeridas).toBe(2000);

      // Exceeding 10,000L clamps to 10,000L
      const rOver = calcularPotabilizacionAgua(15000);
      expect(rOver.esValido).toBe(true);
      expect(rOver.litros).toBe(10000);
      expect(rOver.gotasLejia).toBe(20000);
    });

    it('Property: For all L in (0, 10000], drops are ceil(L * 2) >= 1', () => {
      fc.assert(
        fc.property(fc.double({ min: 0.001, max: 10000, noNaN: true }), (litros) => {
          const res = calcularPotabilizacionAgua(litros);
          expect(res.esValido).toBe(true);
          expect(res.gotasLejia).toBe(Math.ceil(litros * 2));
          expect(res.gotasLejia).toBeGreaterThanOrEqual(1);
          expect(res.minutosReposo).toBe(30);
          expect(res.instruccionesClave.length).toBeGreaterThan(0);
        }),
        { numRuns: 300 }
      );
    });
  });

  // =========================================================================
  // 4. PREPARATION PROGRESS INVARIANTS & DIVISION BY ZERO RESILIENCE
  // =========================================================================
  describe('Preparation Progress — Huaicos (calcularProgresoHuaicos)', () => {
    it('Zero items: Returns 0% without NaN or division by zero', () => {
      const emptyRes = calcularProgresoHuaicos([]);
      expect(emptyRes.porcentajeTotal).toBe(0);
      expect(emptyRes.totalArticulos).toBe(0);
      expect(emptyRes.articulosCompletados).toBe(0);

      CATEGORIAS_HUAICOS.forEach((catId) => {
        expect(emptyRes.desglose[catId].porcentaje).toBe(0);
        expect(emptyRes.desglose[catId].total).toBe(0);
      });
    });

    it('Null or undefined resilience', () => {
      // @ts-expect-error test undefined robustness
      const resUndef = calcularProgresoHuaicos(undefined);
      expect(resUndef.porcentajeTotal).toBe(0);
      expect(resUndef.totalArticulos).toBe(0);

      // @ts-expect-error test null robustness
      const resNull = calcularProgresoHuaicos(null);
      expect(resNull.porcentajeTotal).toBe(0);
    });

    it('Property: Bounds strictly [0, 100]%, integer values, 0 items = 0%, all = 100%', () => {
      const itemArbitrary: fc.Arbitrary<ItemHuaicoChecklist> = fc.record({
        id: fc.uuid(),
        titulo: fc.string({ minLength: 1, maxLength: 40 }),
        descripcion: fc.string(),
        categoriaId: fc.constantFrom(...CATEGORIAS_HUAICOS),
        completado: fc.boolean(),
        esCritico: fc.boolean()
      });

      fc.assert(
        fc.property(fc.array(itemArbitrary, { minLength: 0, maxLength: 300 }), (articulos) => {
          const prog = calcularProgresoHuaicos(articulos);

          // Range [0, 100]
          expect(prog.porcentajeTotal).toBeGreaterThanOrEqual(0);
          expect(prog.porcentajeTotal).toBeLessThanOrEqual(100);
          expect(Number.isInteger(prog.porcentajeTotal)).toBe(true);
          expect(Number.isNaN(prog.porcentajeTotal)).toBe(false);

          if (articulos.length === 0) {
            expect(prog.porcentajeTotal).toBe(0);
          } else if (articulos.every((a) => a.completado)) {
            expect(prog.porcentajeTotal).toBe(100);
          } else if (articulos.every((a) => !a.completado)) {
            expect(prog.porcentajeTotal).toBe(0);
          }

          CATEGORIAS_HUAICOS.forEach((catId) => {
            const cat = prog.desglose[catId];
            expect(cat.porcentaje).toBeGreaterThanOrEqual(0);
            expect(cat.porcentaje).toBeLessThanOrEqual(100);
            expect(Number.isInteger(cat.porcentaje)).toBe(true);
            if (cat.total === 0) {
              expect(cat.porcentaje).toBe(0);
            }
          });
        }),
        { numRuns: 200 }
      );
    });
  });

  describe('Preparation Progress — Mochila (calculatePreparationProgress)', () => {
    it('Zero items: Returns 0% without NaN or division by zero', () => {
      const emptyRes = calculatePreparationProgress([]);
      expect(emptyRes.porcentajeTotal).toBe(0);
      expect(emptyRes.totalArticulos).toBe(0);
      expect(emptyRes.articulosCompletados).toBe(0);

      CATEGORIAS_MOCHILA.forEach((catId) => {
        expect(emptyRes.desglose[catId].porcentaje).toBe(0);
        expect(emptyRes.desglose[catId].total).toBe(0);
      });
    });

    it('Property: Bounds strictly [0, 100]%, integer values, no NaN', () => {
      const articuloArbitrary = fc.record<ArticuloMochila>({
        id: fc.uuid(),
        nombre: fc.string({ minLength: 1, maxLength: 50 }),
        categoriaId: fc.constantFrom(...CATEGORIAS_MOCHILA),
        completado: fc.boolean(),
        cantidadRecomendada: fc.string(),
        esPredeterminado: fc.boolean()
      });

      fc.assert(
        fc.property(fc.array(articuloArbitrary, { minLength: 0, maxLength: 300 }), (articulos) => {
          const prog = calculatePreparationProgress(articulos);

          expect(prog.porcentajeTotal).toBeGreaterThanOrEqual(0);
          expect(prog.porcentajeTotal).toBeLessThanOrEqual(100);
          expect(Number.isInteger(prog.porcentajeTotal)).toBe(true);
          expect(Number.isNaN(prog.porcentajeTotal)).toBe(false);

          if (articulos.length === 0) {
            expect(prog.porcentajeTotal).toBe(0);
          } else if (articulos.every((a) => a.completado)) {
            expect(prog.porcentajeTotal).toBe(100);
          } else if (articulos.every((a) => !a.completado)) {
            expect(prog.porcentajeTotal).toBe(0);
          }

          CATEGORIAS_MOCHILA.forEach((catId) => {
            const cat = prog.desglose[catId];
            expect(cat.porcentaje).toBeGreaterThanOrEqual(0);
            expect(cat.porcentaje).toBeLessThanOrEqual(100);
            expect(Number.isInteger(cat.porcentaje)).toBe(true);
            if (cat.total === 0) {
              expect(cat.porcentaje).toBe(0);
            }
          });
        }),
        { numRuns: 200 }
      );
    });
  });

  // =========================================================================
  // 5. DISTANCE FORMATTER EDGE CASES
  // =========================================================================
  describe('Distance Formatter (formatDistance)', () => {
    it('Handles negative, 0, and NaN distances safely', () => {
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(-10)).toBe('0 m');
      expect(formatDistance(NaN)).toBe('0 m');
    });

    it('Formats meters accurately (< 1000m)', () => {
      expect(formatDistance(45)).toBe('45 m');
      expect(formatDistance(350.4)).toBe('350 m');
      expect(formatDistance(999.4)).toBe('999 m');
    });

    it('Formats kilometers (< 10km with 1 decimal, >= 10km rounded)', () => {
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1250)).toBe('1.3 km');
      expect(formatDistance(9949)).toBe('9.9 km');
      expect(formatDistance(10000)).toBe('10 km');
      expect(formatDistance(15490)).toBe('15 km');
    });
  });
});
