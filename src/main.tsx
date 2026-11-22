import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAppServices, ServicesProvider } from '@/app/services';
import { App } from '@/ui/App';
import '@/ui/theme/global.css';

const services = createAppServices();

// El service worker només existeix al build de producció.
if (import.meta.env.PROD) void services.updates.register();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider services={services}>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
