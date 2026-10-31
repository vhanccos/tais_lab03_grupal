import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sismolisto.app',
  appName: 'SismoListo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
