export const dynamic = 'force-dynamic';

import CommandeDetailPage from './_content';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <CommandeDetailPage params={params} />;
}
