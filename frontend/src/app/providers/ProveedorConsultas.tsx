import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';

type PropiedadesProveedorConsultas = {
  children: ReactNode;
};

export function ProveedorConsultas({ children }: PropiedadesProveedorConsultas) {
  const [clienteConsultas] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60
          },
          mutations: {
            retry: 0
          }
        }
      })
  );

  return <QueryClientProvider client={clienteConsultas}>{children}</QueryClientProvider>;
}