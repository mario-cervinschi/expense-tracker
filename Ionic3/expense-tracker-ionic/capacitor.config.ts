import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Expense Tracker - Ionic',
  webDir: 'dist',
  plugins: {
    Filesystem: {
      requestPermissions: true
    }
  }
};

export default config;
