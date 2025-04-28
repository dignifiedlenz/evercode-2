'use client';

import { Toaster as SonnerToaster } from 'sonner';

export default function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          fontSize: '0.875rem',
          borderRadius: '8px',
          padding: '12px 24px',
          paddingBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        },
        classNames: {
          toast: 'font-morion group relative overflow-hidden',
          success: 'text-white',
          error: 'text-white',
          description: 'text-zinc-300 group-hover:text-zinc-200',
        },
        duration: 2500,
        unstyled: true,
      }}
      expand={false}
      richColors={false}
      closeButton={false}
    />
  );
} 