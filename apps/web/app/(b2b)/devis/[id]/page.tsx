export const dynamic = 'force-dynamic';

import DevisDetailPage from './_content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <DevisDetailPage params={params} />;
}
