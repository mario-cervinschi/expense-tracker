import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Drivers, Storage } from '@ionic/storage';

const store = new Storage({
  name:'__mydb',
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});
store.create();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export { store };
