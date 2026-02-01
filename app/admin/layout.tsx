import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login?redirect=/admin');
  }

  try {
    const payload = await verifyToken(token);
    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/login?redirect=/admin');
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
