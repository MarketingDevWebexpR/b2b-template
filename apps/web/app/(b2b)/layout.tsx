export const dynamic = 'force-dynamic';

import B2BLayoutContent from './_layout-content';

interface B2BLayoutProps {
  children: React.ReactNode;
}

/**
 * B2B E-commerce Layout (Server Component)
 *
 * This layout is a server component that wraps the client-side
 * B2BLayoutContent which provides B2B context and UI components.
 */
export default function B2BLayout({ children }: B2BLayoutProps) {
  return <B2BLayoutContent>{children}</B2BLayoutContent>;
}
