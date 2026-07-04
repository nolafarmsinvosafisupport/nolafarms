'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <section
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a2b16',
            padding: '24px',
            fontFamily: 'Georgia, serif',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <p style={{ marginBottom: 24, fontSize: 56, color: '#5a9a4a' }}>Oops.</p>
            <h1 style={{ fontSize: 28, lineHeight: 1.3, color: '#f5f1e8', margin: 0 }}>
              Something went wrong loading Nola Farms.
            </h1>
            <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.6, color: 'rgba(245,241,232,0.8)' }}>
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: 32,
                background: '#5a9a4a',
                color: '#fff',
                border: 'none',
                padding: '12px 28px',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
