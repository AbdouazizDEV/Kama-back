import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kama API - Documentation',
  description: 'API de la plateforme de location multi-catégories Kama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
