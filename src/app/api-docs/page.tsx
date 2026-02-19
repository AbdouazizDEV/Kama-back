'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique de SwaggerUI pour éviter les problèmes SSR et CSS
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la documentation...</p>
        </div>
      </div>
    ),
  }
);

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charger le CSS de Swagger UI dynamiquement
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css';
    document.head.appendChild(link);

    fetch('/api/swagger')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement de la documentation:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      // Nettoyer le lien CSS lors du démontage
      const existingLink = document.querySelector('link[href*="swagger-ui.css"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Aucune documentation disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}
