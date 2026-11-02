# 🚨 SismoListo

Aplicación web progresiva (PWA) y móvil diseñada para operar **100% offline**, orientada a la preparación, gestión y respuesta ante sismos y huaicos bajo los lineamientos oficiales de **INDECI** y **SINAGERD**.

🔗 **Demo en vivo:** [https://lab03-2gb06f3v5-vhanccos-projects.vercel.app](https://lab03-2gb06f3v5-vhanccos-projects.vercel.app)

---

## 📱 Características Principales

- **🎒 Mochila de Emergencia (Primeras 24h):** Checklist inteligente categorizado (artículos básicos, bebés, adultos mayores, mascotas) con cálculo de progreso y soporte de vencimientos.
- **📦 Caja de Reserva (Días 2 al 4):** Control y almacenamiento de suministros para aislamiento prolongado.
- **📋 Plan Familiar de Emergencia:** Registro de integrantes, roles, lugares de encuentro, rutas de evacuación y acceso rápido al **119** (mensajería de voz de emergencia).
- **🗺️ Mapa de Evacuación y Zonas Seguras:** Visualización y gestión de puntos seguros offline.
- **🌧️ Módulo Huaicos:** Recomendaciones, puntos críticos y listas de preparación específicas para lluvias torrenciales y deslizamientos.
- **🛠️ Herramientas SOS:** Linterna estroboscópica, silbato sonoro/alarma de rescate en código morse y guía rápida de primeros auxilios.
- **⚡ 100% Offline-First:** Persistencia en almacenamiento local y Service Worker (PWA) garantizando disponibilidad sin conexión a internet ni red eléctrica.

---

## 🛠️ Stack Tecnológico

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Empaquetador:** [Vite 6](https://vite.dev/)
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker con Workbox)
- **Móvil:** [Capacitor 8](https://capacitorjs.com/) (Android)
- **Testing:** [Vitest](https://vitest.dev/), Testing Library, Fast-Check (Property-Based Testing)

---

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js (versión 18 o superior)
- npm

### Instalación
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd lab03

# Instalar dependencias
npm install
```

### Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local |
| `npm run build` | Compila TypeScript y genera la build optimizada en `/dist` |
| `npm run preview` | Previsualiza localmente la build de producción |
| `npm run test` | Ejecuta las suites de pruebas unitarias y de integración |
| `npm run test:watch` | Ejecuta las pruebas en modo interactivo/observador |

---

## 🌐 Despliegue en Vercel

El proyecto es directamente compatible con Vercel:

1. Importa el repositorio en [Vercel](https://vercel.com/new).
2. La plataforma detectará automáticamente la configuración:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Haz clic en **Deploy**.

O mediante Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

## 📱 Compilación Móvil (Android con Capacitor)

Para generar o sincronizar la aplicación Android:

```bash
# Compilar la aplicación web
npm run build

# Sincronizar assets con el proyecto nativo
npx cap sync

# Abrir en Android Studio
npx cap open android
```

---

## 📄 Licencia

Este proyecto está desarrollado para fines educativos y comunitarios.
Diseñado conforme a las pautas de seguridad de INDECI.
