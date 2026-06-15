import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.max.numbergame',
  appName: 'Number',
  webDir: 'dist',
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-8620196010585213~2010771616'
    }
  }
};

export default config;
