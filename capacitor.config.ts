import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gingoogcity.agriculture',
  appName: 'Gingoog City Agriculture',
  webDir: 'dist',
  server: {
    // App loads over http (not the https default) so it can call the
    // plain-http local backend without hitting mixed-content blocking.
    androidScheme: 'http'
  }
};

export default config;
